import { Board } from "../../board";
import { reverseColor } from "../../color";
import { isCoordinateEql } from "../../coordinate";
import { Turn } from "../../turn";
import { PieceType } from "../../piece.consts";
import { parseKey, parseToKey, toKey } from "../../moves-tree.utils";
import { Node } from "../../moves-tree.types";

type TurnSubSet = Pick<Turn, "from" | "to" | "color">;

export abstract class GlobalRule {
  public abstract markNodeWithChilds(
    node: Node,
    prevNode: Node | undefined,
    board: Board,
    turns: Turn[]
  ): void;
  public abstract isMoveValid(
    node: Node,
    board: Board,
    turn: TurnSubSet
  ): boolean;
}

export class CheckMateGlobalRule2 extends GlobalRule {
  constructor() {
    super();
  }

  private mainPieceType = PieceType.King;

  public isMoveValid(node: Node, board: Board, turn: TurnSubSet) {
    const from = turn.from;
    const to = turn.to;
    const fromHash = toKey(from[0], from[1]);
    const toHash = toKey(to[0], to[1]);

    const kingCoordinate = board.findUniqPiece(turn.color, this.mainPieceType);

    const nextNode = node.movements[fromHash][toHash].next;

    for (const nextMovementFrom in nextNode.movements) {
      for (const nextMovementTo in nextNode.movements[nextMovementFrom]) {
        const nextTo = parseKey(nextMovementTo);

        const actualCurrentKingCoordinate = isCoordinateEql(
          kingCoordinate,
          from
        )
          ? to
          : kingCoordinate;
        if (isCoordinateEql(actualCurrentKingCoordinate, nextTo)) {
          return false;
        }
      }
    }
    return true;
  }

  public markNodeWithChilds(node: Node, prevNode: Node, board: Board) {
    let currentColor = node.color;

    const kingCoordinate = board.findUniqPiece(
      currentColor,
      this.mainPieceType
    );

    const enemyKingCoordinate = board.findUniqPiece(
      reverseColor(currentColor),
      this.mainPieceType
    );

    let allMovesLeadToMateForCurrentColor = true;
    for (const movementFrom in node.movements) {
      const from = parseKey(movementFrom);
      for (const movementTo in node.movements[movementFrom]) {
        const to = parseToKey(movementTo);
        if (
          prevNode &&
          to[0] === enemyKingCoordinate[0] &&
          to[1] === enemyKingCoordinate[1]
        ) {
          console.log(
            "node under check",
            prevNode.color,
            Object.keys(prevNode.movements)
          );
          prevNode.underCheck = true;
        }

        const moveResultData = node.movements[movementFrom][movementTo];

        const nextNode = moveResultData.next;

        if (
          prevNode &&
          enemyKingCoordinate[0] === to[0] &&
          enemyKingCoordinate[1] === to[1]
        ) {
          prevNode.underCheck = true;
        }

        let leadsToCurrentColorCheck = false;

        // we search for enemy moves to current color kings position
        for (const nextMovementFrom in nextNode.movements) {
          const actualCurrentKingCoordinate = isCoordinateEql(
            // in case king made a move
            kingCoordinate,
            from
          )
            ? to
            : kingCoordinate;
          const nextMoveToCurrentKingKey = toKey(
            // it doesn't detect if has transforming choice
            actualCurrentKingCoordinate[0],
            actualCurrentKingCoordinate[1]
            // actualCurrentKingCoordinate[2]
          );

          if (nextNode.movements[nextMovementFrom][nextMoveToCurrentKingKey]) {
            leadsToCurrentColorCheck = true;
            moveResultData.suisidal = true;
          }
        }
        if (!leadsToCurrentColorCheck) {
          // at least one currentColor move doesn't lead to immediate check
          allMovesLeadToMateForCurrentColor = false;
        }
      }
    }
    if (allMovesLeadToMateForCurrentColor) {
    }
  }
}
