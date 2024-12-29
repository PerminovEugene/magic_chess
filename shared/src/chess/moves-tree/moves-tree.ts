import { Board } from "../board/board";
import { Turn, TurnType } from "../turn";
import { Color } from "../color";
import { Action } from "../rules/piece-movement/movement-rule";
import { AffectType } from "../affect/affect.types";
import { reverseAffects } from "../affect/affect";
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
 * Root keeps all moves for currentColor, each node keeps all possible moves for the next player
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

  /**
   * Move root to the next level by turn data
   * @param fromCoordinate
   * @param fromCoordinate
   * @param selectedPieceType - using for transforming pawn to another piece
   */
  public processTurn(
    turn: Turn
    // toCoordinate: Coordinate,
    // selectedPieceType?: PieceType // this is donkey solution, but for now it's not clear how to keep dynamic data
  ) {
    const fromCoordinate = turn.affects.find(
      (a) => a.type === AffectType.move && a.userSelected
    )?.from;
    if (!fromCoordinate) {
      throw new Error("From coordinate is not found");
    }
    const from = serializeCoordinate(fromCoordinate);
    const to = serializeAffects(turn.affects);

    // bullshit
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

    this.root = nextNode;
    this.updateBoard(movementResults.affects);

    this.raiseTree();

    this.forEachChild(this.root, (node) => {
      this.applyGlobalRules(node, this.root);
    });

    this.treeShaking();

    // handling transformation
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
      rule.markNodeWithChilds(
        node,
        prevNode,
        // this.squares,
        this.board,
        this.initialTurns
      );
    }
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
    this.treeShaking();
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
  private treeShaking() {
    Object.keys(this.root.movements).forEach((fromKey) => {
      Object.keys(this.root.movements[fromKey]).forEach((toKey) => {
        if (this.root.movements[fromKey][toKey].suisidal) {
          delete this.root.movements[fromKey][toKey];
        }
      });
      if (Object.keys(this.root.movements[fromKey]).length === 0) {
        delete this.root.movements[fromKey];
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

        const reversedAffects = reverseAffects(movementResultAffects);
        this.updateBoard(reversedAffects);
      });
    });
  }

  private forEachSubTreeLeaf(
    { movements }: Node,
    callback: (node: Node) => void
  ) {
    Object.keys(movements).forEach((fromKey) => {
      Object.keys(movements[fromKey]).forEach((toKey) => {
        const movementResult = movements[fromKey][toKey];
        const nextNode = movementResult.next;
        const movementResultAffects = movementResult.affects;

        this.updateBoard(movementResultAffects);
        if (Object.keys(nextNode.movements).length === 0) {
          callback(nextNode);
        } else {
          this.forEachSubTreeLeaf(nextNode, callback);
        }
        const reversedAffects = reverseAffects(movementResultAffects);
        this.updateBoard(reversedAffects);
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
