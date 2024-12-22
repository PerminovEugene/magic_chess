import { Board } from "../../board";
import { Coordinate } from "../../coordinate";
import { Turn } from "../../game";
import { Color, Piece } from "../../piece";
import {
  Affect,
  AvailableMove,
  reverseAffects,
} from "../piece-movement/movement-rule";
import { reverseColor } from "../../color";
import { Hash, Node, X, Y } from "./moves-tree.types";
import { GlobalRule } from "./check-mate.global-rule";

export function toKey(x: X, y: Y) {
  return `${x},${y}`;
}
export function coordToKey(c: Coordinate) {
  return `${c[0]},${c[1]}`;
}
export function parseKey(key: Hash): Coordinate {
  return key.split(",").map(Number) as Coordinate;
}

/**
 * This structure keep all possible moves for both players
 * Root keeps all moves for currentColor, each node keeps all possible moves for the next player
 */
export class MovesTree {
  private root: Node;
  // private squares: Board["squares"];

  constructor(
    private board: Board, // original b
    private initialTurns: Turn[],
    private globalRules: GlobalRule[],
    private length: number,
    currentColor: Color
  ) {
    // this.squares = board.buildCells();
    // this.board.duplicatePosition(this.squares);

    this.root = this.createEmptyNode(currentColor);
    this.fillUpRoot();
  }

  /**
   * Move root to the next level by turn data
   * @param turn
   */
  public processTurn(fromCoordinate: Coordinate, toCoordinate: Coordinate) {
    const from = toKey(fromCoordinate[0], fromCoordinate[1]);
    const to = toKey(toCoordinate[0], toCoordinate[1]);

    let movementResults = this.root.movements[from][to];

    const nextNode = movementResults.next;
    const movementAffects = movementResults.affects;
    this.root = nextNode;
    this.updateSquraes(fromCoordinate, toCoordinate, movementAffects);
    // this.board.move(turn);

    this.raiseTree();

    this.forEachChild(this.root, (node) => {
      this.applyGlobalRules(node, this.root);
    });
    this.treeShaking();
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
        this.board.squares,
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
    this.treeShaking();

    if (this.length > 1) {
      this.forEachChild(this.root, (node) => {
        this.applyGlobalRules(node, this.root);
      });
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

        const from = parseKey(fromKey);
        const to = parseKey(toKey);
        const killed = this.updateSquraes(from, to, movementResultAffects);

        callback(nextNode);

        const reversedAffects = reverseAffects(movementResultAffects, killed);
        this.updateSquraes(to, from, reversedAffects);
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
        const to = parseKey(toKey);

        const killed = this.updateSquraes(from, to, movementResultAffects);
        if (Object.keys(nextNode.movements).length === 0) {
          callback(nextNode);
        } else {
          this.forEachSubTreeLeaf(nextNode, callback);
        }
        const reversedAffects = reverseAffects(movementResultAffects, killed);
        this.updateSquraes(to, from, reversedAffects);
      });
    });
  }

  private updateSquraes(
    from: Coordinate,
    to: Coordinate,
    affects?: Affect[]
  ): Piece[] {
    const [fromX, fromY] = from;
    const [toX, toY] = to;

    const fromCell = this.board.squares[fromY][fromX];
    const toCell = this.board.squares[toY][toX];

    return this.board.updateCellsOnMove(
      // this.squares,
      this.board.squares,
      fromCell,
      toCell,
      affects
    );
  }

  // it expects empty node which will be filled up by current state of this.squares
  private fillUpNode(node: Node) {
    this.board.squares.forEach((row, y) => {
      row.forEach((cell, x) => {
        const key = toKey(x, y);
        const piece = cell.getPiece();
        if (piece && piece.color === node.color) {
          node.movements[key] = {};

          const availableMoves: AvailableMove[] = [];

          piece.movementRules.forEach((rule) => {
            const ruleMoves = rule.availableMoves(
              x,
              y,
              // this.squares,
              this.board.squares,
              this.initialTurns
            );
            availableMoves.push(...ruleMoves);
          });
          const reversedColor = reverseColor(node.color);
          availableMoves.forEach(([toX, toY, affects]) => {
            const nextMoveKey = toKey(toX, toY);

            let newNode: Node = this.createEmptyNode(reversedColor);
            node.movements[key][nextMoveKey] = {
              affects,
              next: newNode,
            };
          });
        }
      });
    });
  }
}
