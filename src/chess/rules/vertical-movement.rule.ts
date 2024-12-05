import { Cell } from "../cell";
import { Direction, MovementRule } from "../rules";

export type VerticalMovementRuleConfig = {
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Set<Direction>;
};
export class VerticalMovementRule extends MovementRule {
  constructor({
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
  }: VerticalMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions);
  }

  public availableMoves(fromX: number, fromY: number, squares: Cell[][]) {
    const moves = [];
    let availableDirections = new Set<Direction>([
      Direction.Up,
      Direction.Down,
    ]);
    const possibleDirrections = [Direction.Up, Direction.Down];
    for (let diff = 1; diff <= this.distance; diff++) {
      for (let possibleDirrection of possibleDirrections) {
        const newY =
          possibleDirrection == Direction.Up ? fromY + diff : fromY - diff;
        if (newY >= squares.length) {
          diff = this.distance + 1;
        }
        if (availableDirections.has(possibleDirrection)) {
          if (newY >= squares.length || newY < 0) {
            diff = this.distance + 1;
          }
          const possibleMove = squares[fromX][newY];
          const color = squares[fromX][fromY].getPiece().color;
          if (this.moveToEmpty && possibleMove.isEmpty()) {
            // can move to empty square
            moves.push(fromX, newY);
          } else if (this.moveToKill && !possibleMove.isEmpty()) {
            const newLocationPieceColor = possibleMove.getPiece().color;
            if (newLocationPieceColor !== color) {
              // can move to enemy square
              moves.push(fromX, newY);
            }
            if (this.collistion) {
              availableDirections.delete(possibleDirrection);
            }
          }
        }
      }
    }

    return moves;
  }
}
