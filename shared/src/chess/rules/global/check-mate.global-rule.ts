import { Board } from "../../board/board";
import { reverseColor } from "../../color";
import { isCoordinateEql } from "../../coordinate";
import { Turn } from "../../turn";
import { PieceType } from "../../piece/piece.constants";
import { serializeToCoordinate } from "../../moves-tree/moves-tree.utils";
import { Node } from "../../moves-tree/moves-tree.types";
import { getUserSelectedMoveAffect } from "../../affect/affect.utils";

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

  public markNodeWithChilds(node: Node, prevNode: Node, board: Board) {
    const currentColor = node.color;

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
      for (const movementTo in node.movements[movementFrom]) {
        const moveResultData = node.movements[movementFrom][movementTo];

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
        }
      }
    }
  }
}
