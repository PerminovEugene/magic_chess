import { Board } from "../board/board";
import { Turn } from "../turn";
import { Color } from "../color";
import { Action } from "../rules/piece-movement/movement-rule";
import { AffectType } from "../affect/affect.types";
import { reverseColor } from "../color";
import { Node } from "./moves-tree.types";
import { GlobalRule } from "../rules/global/check-mate.global-rule";
import {
  serializeAffects,
  serializeCoordinate,
  serializeXY,
} from "./moves-tree.utils";

/**
 * This structure keep all possible moves for both players
 * Root keeps all moves for currentColor, each node keeps all possible moves for the next player.
 * It applies node marks from global rules.
 * Restrictions: checkmate/stalemate can not be detected on the first turn.
 *   So all tests on check mate should contains at least one process turn cal
 */
export class MovesTree {
  private root: Node;

  constructor(
    private board: Board, // original b
    private initialTurns: Turn[],
    private globalRules: GlobalRule[],
    private length: number,
    currentColor: Color
  ) {
    this.root = this.createEmptyNode(currentColor);
    this.fillUpRoot();
  }

  private fillUpRoot() {
    this.fillUpNode(this.root); // contain all moves for the first turn

    let i = 1;
    while (i < this.length) {
      this.raiseTree();
      i += 1;
    }
    this.applyGlobalRules(this.root);

    if (this.length > 1) {
      this.forEachChild(this.root, (node) => {
        this.applyGlobalRules(node, this.root);
      });
    }
    this.treeShaking(this.root);
    if (this.length > 1) {
      this.forEachChild(this.root, (node) => {
        this.treeShaking(node);
      });
    }
  }

  /**
   * Move root to the next level by turn data
   * @param fromCoordinate
   * @param fromCoordinate
   * @param selectedPieceType - using for transforming pawn to another piece
   */
  public processTurn(turn: Turn) {
    const fromCoordinate = turn.affects.find(
      (a) => a.type === AffectType.move && a.userSelected
    )?.from;
    if (!fromCoordinate) {
      throw new Error("From coordinate is not found");
    }
    const from = serializeCoordinate(fromCoordinate);
    const to = serializeAffects(turn.affects);

    // console.log(from, to, this.root.movements[from]);

    let movementResults = this.root.movements[from][to];

    // const movementAffects = movementResults.affects;

    // if (selectedPieceType) {
    //   const transformationAffect = movementAffects?.find(
    //     (a) => a.type === AffectType.transformation
    //   );
    //   if (!transformationAffect) {
    //     throw new Error("Transformation affect is not found");
    //   }
    //   transformationAffect.destPieceType = selectedPieceType;
    // }

    const nextNode = movementResults.next;
    const prevRoot = this.root;
    this.root = nextNode;

    this.updateBoard(movementResults.affects);

    this.raiseTree();

    this.applyGlobalRules(this.root, prevRoot);

    this.forEachChild(this.root, (node) => {
      this.applyGlobalRules(node, this.root);
    });

    this.treeShaking(this.root);
  }

  public getRoot() {
    return this.root;
  }

  private createEmptyNode(color: Color): Node {
    return {
      color,
      movements: {},
    };
  }
  private applyGlobalRules(node: Node, prevNode?: Node) {
    for (const rule of this.globalRules) {
      rule.markNodeWithChilds(node, prevNode, this.board, this.initialTurns);
    }
  }

  private raiseTree() {
    this.forEachSubTreeLeaf(this.root, (node) => {
      this.fillUpNode(node);
    });
  }

  /**
   * It cuts off all invalid moves from the tree
   * Like moves that leads to check
   */
  private treeShaking(node: Node) {
    Object.keys(node.movements).forEach((fromKey) => {
      Object.keys(node.movements[fromKey]).forEach((toKey) => {
        if (node.movements[fromKey][toKey].suisidal) {
          delete node.movements[fromKey][toKey];
        }
      });
      if (Object.keys(node.movements[fromKey]).length === 0) {
        delete node.movements[fromKey];
      }
    });
  }

  private forEachChild({ movements }: Node, callback: (node: Node) => void) {
    Object.keys(movements).forEach((fromKey) => {
      Object.keys(movements[fromKey]).forEach((toKey) => {
        const movementResult = movements[fromKey][toKey];
        const nextNode = movementResult.next;
        const movementResultAffects = movementResult.affects;

        this.updateBoard(movementResultAffects);

        callback(nextNode);

        // const reversedAffects = reverseAffects(movementResultAffects);
        // this.updateBoard(reversedAffects);
        this.board.revertMove(movementResultAffects);
      });
    });
  }

  private forEachSubTreeLeaf(
    { movements }: Node,
    callback: (node: Node) => void
  ) {
    Object.keys(movements).forEach((fromKey) => {
      Object.keys(movements[fromKey]).forEach((toKey) => {
        const { next, affects } = movements[fromKey][toKey];

        this.updateBoard(affects);
        if (Object.keys(next.movements).length === 0) {
          callback(next);
        } else {
          this.forEachSubTreeLeaf(next, callback);
        }
        this.board.revertMove(affects);
      });
    });
  }

  private updateBoard(action: Action) {
    this.board.updateCellsOnMove(action);
  }

  // it expects empty node which will be filled up by current state of this.squares
  private fillUpNode(node: Node) {
    this.board.forEachPiece(node.color, (piece, x, y) => {
      const fromKey = serializeXY(x, y);
      if (piece && piece.color === node.color) {
        node.movements[fromKey] = {};

        const availableMoves: Action[] = this.board.getPieceAvailableMoves(
          x,
          y,
          this.initialTurns
        );

        const reversedColor = reverseColor(node.color);

        availableMoves.forEach((affects) => {
          const toKey = serializeAffects(affects);

          let newNode: Node = this.createEmptyNode(reversedColor);

          node.movements[fromKey][toKey] = {
            affects,
            next: newNode,
          };
        });
      }
    });
  }
}
