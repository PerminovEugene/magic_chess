import { Board } from "../../board";
import { Cell } from "../../cell";
import { reverseColor } from "../../color";
import { Coordinate, isCoordinateEql } from "../../coordinate";
import { Turn } from "../../game";
import { Color, PieceType } from "../../piece";
import { AvailableMove } from "..";
import { MovesTree, parseKey, toKey } from "./moves-tree";
import { Node } from "./moves-tree.types";

type TurnSubSet = Pick<Turn, "from" | "to" | "color">;

export abstract class GlobalRule {
  public abstract markNodeWithChilds(
    node: Node,
    prevNode: Node | undefined,
    cells: Cell[][],
    turns: Turn[]
  ): void;
  public abstract isMoveValid(
    node: Node,
    cells: Cell[][],
    turn: TurnSubSet
  ): boolean;
}
export class CheckMateGlobalRule2 extends GlobalRule {
  constructor(private board: Board) {
    super();
  }

  private mainPieceType = PieceType.King;

  public isMoveValid(node: Node, cells: Cell[][], turn: TurnSubSet) {
    const from = turn.from;
    const to = turn.to;
    const fromHash = toKey(from[0], from[1]);
    const toHash = toKey(to[0], to[1]);

    const kingCoordinate = this.board.findUniqPiece(
      cells,
      turn.color,
      this.mainPieceType
    );

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

  public markNodeWithChilds(
    node: Node, // black -> white -> black
    prevNode: Node,
    cells: Cell[][] // in node position
  ) {
    let currentColor = node.color;

    const kingCoordinate = this.board.findUniqPiece(
      cells,
      currentColor,
      this.mainPieceType
    );

    const enemyKingCoordinate = this.board.findUniqPiece(
      cells,
      reverseColor(currentColor),
      this.mainPieceType
    );
    const enemyKingKey = toKey(enemyKingCoordinate[0], enemyKingCoordinate[1]);

    let allMovesLeadToMateForCurrentColor = true;
    for (const movementFrom in node.movements) {
      const from = parseKey(movementFrom);
      for (const movementTo in node.movements[movementFrom]) {
        const to = parseKey(movementTo);
        const moveResultData = node.movements[movementFrom][movementTo];

        const nextNode = moveResultData.next;

        if (prevNode && enemyKingKey === movementTo) {
          // this move to king, means opponent under check now
          //
          prevNode.underCheck = true;
        }

        let leadsToCurrentColorCheck = false;

        // console.log("-handle->", from, to);

        // we search for enemy moves to current color kings position
        for (const nextMovementFrom in nextNode.movements) {
          const actualCurrentKingCoordinate = isCoordinateEql(
            // in case king made a move
            kingCoordinate,
            from
          )
            ? to
            : kingCoordinate;
          const nextToKey = toKey(
            actualCurrentKingCoordinate[0],
            actualCurrentKingCoordinate[1]
          );

          if (nextNode.movements[nextMovementFrom][nextToKey]) {
            // opponen will eat king. Current color under check for its initial move
            // console.log("move to king exist");
            // console.log(
            //   "marked",
            //   nextNode.movements[nextMovementFrom][nextToKey].next
            // );
            // meant current color will be killed in this scenario, means check
            leadsToCurrentColorCheck = true;
            // nextNode.movements[nextMovementFrom][nextToKey].next.underCheck =
            //   true;
            moveResultData.suisidal = true;
            // nextNode.underCheck = true;
          }
          // if (isCoordinateEql(actualCurrentKingCoordinate, nextTo)) {
          //   nextNode.movements[nextMovementFrom][
          //     nextMovementTo
          //   ].next.underCheck = true;
          // }
          // if king made a move we need to use its new position

          // TODO add checking kill affects later
        }
        if (!leadsToCurrentColorCheck) {
          // at least one currentColor move doesn't lead to immediate check
          // console.log("not all moves leads to check");
          allMovesLeadToMateForCurrentColor = false;
        }
      }

      //   for (const nextMovementTo in nextNode.movements[nextMovementFrom]) {
      //     // we search for enemy moves to current color kings position
      //     const nextTo = parseKey(nextMovementTo);

      //     // if king made a move we need to use its new position
      //     const actualCurrentKingCoordinate = isCoordinateEql(
      //       kingCoordinate,
      //       from
      //     )
      //       ? from
      //       : to;
      //     // TODO add checking kill affects later
      //     console.log(
      //       "actualCurrentKingCoordinate",
      //       actualCurrentKingCoordinate
      //     );
      //     if (isCoordinateEql(actualCurrentKingCoordinate, nextTo)) {
      //       nextNode.movements[nextMovementFrom][
      //         nextMovementTo
      //       ].next.underCheck = true;
      //       leadsToCheck = true;
      //     }
      //   }
      // }
      // if (!leadsToCheck) {
      //   // at least one currentColor move doesn't lead to immediate check
      //   allMovesLeadToMate = false;
      // }
      // }
    }
    // console.log("-", node);
    if (allMovesLeadToMateForCurrentColor) {
      // console.log("allMovesLeadToMate", node);
      // if (prevNode.underCheck) {
      //   node.winner = reverseColor(currentColor);
      // } else {
      //   node.staleMate = true;
      // }
    }
  }
}
