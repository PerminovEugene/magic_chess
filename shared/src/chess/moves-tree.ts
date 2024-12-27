import { Board } from "./board";
import { Coordinate } from "./coordinate";
import { Turn } from "./turn";
import { PieceType } from "./piece.consts";
import { Color } from "./color";
import { AvailableMove } from "./rules/piece-movement/movement-rule";
import { Affect, AffectType } from "./affect.types";
import { reverseAffects } from "./affect";
import { reverseColor } from "./color";
import { Node } from "./moves-tree.types";
import { GlobalRule } from "./rules/global/check-mate.global-rule";
import { toKey, parseKey, parseToKey } from "./moves-tree.utils";

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
    fromCoordinate: Coordinate,
    toCoordinate: Coordinate,
    selectedPieceType?: PieceType // this is donkey solution, but for now it's not clear how to keep dynamic data
  ) {
    const from = toKey(fromCoordinate[0], fromCoordinate[1]);
    const to = toKey(toCoordinate[0], toCoordinate[1], selectedPieceType);

    let movementResults = this.root.movements[from][to];

    const movementAffects = movementResults.affects;

    if (selectedPieceType) {
      const transformationAffect = movementAffects?.find(
        (a) => a.type === AffectType.transformation
      );
      if (!transformationAffect) {
        throw new Error("Transformation affect is not found");
      }
      transformationAffect.destPieceType = selectedPieceType;
    }

    const nextNode = movementResults.next;
    // console.log(JSON.stringify(nextNode, null, 2));
    this.root = nextNode;
    this.updateBoard(fromCoordinate, toCoordinate, movementAffects);

    this.raiseTree();

    this.forEachChild(this.root, (node) => {
      this.applyGlobalRules(node, this.root);
    });

    this.treeShaking();

    // handling transformation
  }

  processTurnDynamicData(turn: Turn) {}

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
          console.log("delete suisidal", fromKey, toKey);
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

        const from = parseKey(fromKey);
        const [toX, toY] = parseToKey(toKey);

        this.updateBoard(from, [toX, toY], movementResultAffects);

        callback(nextNode);

        const reversedAffects = reverseAffects(movementResultAffects);
        if (reversedAffects?.length) {
          console.log("reversedAffects", reversedAffects);
        }
        this.updateBoard([toX, toY], from, reversedAffects);
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

        const from = parseKey(fromKey);
        const [toX, toY] = parseToKey(toKey);

        this.updateBoard(from, [toX, toY], movementResultAffects);
        if (Object.keys(nextNode.movements).length === 0) {
          callback(nextNode);
        } else {
          this.forEachSubTreeLeaf(nextNode, callback);
        }
        // console.log("killed", killed, movementResultAffects);
        const reversedAffects = reverseAffects(movementResultAffects);
        // console.log("reversedAffects", reversedAffects);
        this.updateBoard([toX, toY], from, reversedAffects);
      });
    });
  }

  private updateBoard(from: Coordinate, to: Coordinate, affects?: Affect[]) {
    const [toX, toY] = to;
    const move = [toX, toY, affects] as AvailableMove;

    this.board.updateCellsOnMove(from, move);
  }

  // it expects empty node which will be filled up by current state of this.squares
  private fillUpNode(node: Node) {
    this.board.forEachPiece(node.color, (piece, x, y) => {
      const key = toKey(x, y);
      if (piece && piece.color === node.color) {
        node.movements[key] = {};

        const availableMoves: AvailableMove[] =
          this.board.getPieceAvailableMoves(x, y, this.initialTurns);

        const reversedColor = reverseColor(node.color);
        availableMoves.forEach(([toX, toY, affects]) => {
          const transformationAffect = affects?.find(
            (a) => a.type === AffectType.transformation
          );
          const nextMoveKey = toKey(
            toX,
            toY,
            transformationAffect?.destPieceType
          );

          let newNode: Node = this.createEmptyNode(reversedColor);
          node.movements[key][nextMoveKey] = {
            ...(affects ? { affects } : {}),
            next: newNode,
          };
        });
      }
    });
  }
}
