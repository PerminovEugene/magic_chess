import { Board } from "../../board/board";
import { reverseColor } from "../../color";
import { isCoordinateEql } from "../../coordinate";
import { Turn } from "../../turn";
import { PieceType } from "../../piece/piece.constants";
import { serializeToCoordinate } from "../../moves-tree/moves-tree.utils";
import { Node } from "../../moves-tree/moves-tree.types";
import { getUserSelectedMoveAffect } from "../../affect/affect.utils";

type TurnSubSet = Pick<Turn, "affects" | "color">;

export abstract class GlobalRule {
  public abstract markNodeWithChilds(
    node: Node,
    prevNode: Node | undefined,
    board: Board,
    turns: Turn[]
  ): void;
}

export class CheckMateGlobalRule extends GlobalRule {
  constructor() {
    super();
  }

  private mainPieceType = PieceType.King;

  // public isMoveValid(node: Node, board: Board, turn: TurnSubSet) {
  //   const from = getUserSelectedMoveAffect(turn.affects).from;
  //   const to = getUserSelectedMoveAffect(turn.affects).to;

  //   const fromHash = serializeCoordinate(from);
  //   const toHash = serializeCoordinate(to);

  //   const kingCoordinate = board.findUniqPiece(turn.color, this.mainPieceType);

  //   const nextNode = node.movements[fromHash][toHash].next;

  //   for (const nextMovementFrom in nextNode.movements) {
  //     for (const nextMovementTo in nextNode.movements[nextMovementFrom]) {
  //       const nextTo = parseKey(nextMovementTo);

  //       const actualCurrentKingCoordinate = isCoordinateEql(
  //         kingCoordinate,
  //         from
  //       )
  //         ? to
  //         : kingCoordinate;
  //       if (isCoordinateEql(actualCurrentKingCoordinate, nextTo)) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }

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

    // let allMovesLeadToMateForCurrentColor = true;
    for (const movementFrom in node.movements) {
      // const from = parseKey(movementFrom);
      for (const movementTo in node.movements[movementFrom]) {
        const moveResultData = node.movements[movementFrom][movementTo];

        // const to = parseToKey(movementTo);
        const moveAffect = getUserSelectedMoveAffect(moveResultData.affects);
        if (
          prevNode &&
          !prevNode.underCheck &&
          moveAffect.to[0] === enemyKingCoordinate[0] &&
          moveAffect.to[1] === enemyKingCoordinate[1]
        ) {
          prevNode.underCheck = true;
          continue;
        }

        const nextNode = moveResultData.next;

        // let leadsToCurrentColorCheck = false;

        // we search for enemy moves to current color kings position
        for (const nextMovementFrom in nextNode.movements) {
          const actualCurrentKingCoordinate = isCoordinateEql(
            // in case king made a move
            kingCoordinate,
            moveAffect.from
          )
            ? moveAffect.to
            : kingCoordinate;

          const nextMoveToCurrentKingKey = serializeToCoordinate(
            // it doesn't detect if has transforming choice
            actualCurrentKingCoordinate
          );

          const toObj = nextNode.movements[nextMovementFrom];
          for (const nextMoveTo in toObj) {
            if (nextMoveTo.startsWith(nextMoveToCurrentKingKey)) {
              // leadsToCurrentColorCheck = true;
              moveResultData.suisidal = true;
            }
          }

          // if (nextNode.movements[nextMovementFrom][nextMoveToCurrentKingKey]) {
          //   // leadsToCurrentColorCheck = true;
          //   moveResultData.suisidal = true;
          // }
        }
        // if (!leadsToCurrentColorCheck) {
        //   // at least one currentColor move doesn't lead to immediate check
        //   allMovesLeadToMateForCurrentColor = false;
        // }
      }
    }
    // if (allMovesLeadToMateForCurrentColor) {
    // }
  }
}
