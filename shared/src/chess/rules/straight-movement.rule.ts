import { Cell } from "../cell";
import { Direction, MovementRule } from "./rules";

export type StraightMovementRuleConfig = {
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Set<Direction>;
};
export abstract class StraightMovementRule extends MovementRule {
  constructor(
    moveToEmpty: boolean,
    moveToKill: boolean,
    collision: boolean, // true - will move until first enemy, false - will jump like horse
    distance: number,
    directions: Set<Direction>
  ) {
    super(moveToEmpty, moveToKill, collision, distance, directions);
  }

  protected abstract possibleDirrections: Direction[];
  protected abstract calculateNewCoord: (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ) => [number, number];

  protected isCoordInvalid(x: number, y: number, size: number) {
    return x >= size || x < 0 || y >= size || y < 0;
  }

  public availableMoves(
    fromX: number,
    fromY: number,
    squares: Cell[][]
  ): [number, number][] {
    const moves: [number, number][] = [];
    let availableDirections = new Set<Direction>([
      Direction.Up,
      Direction.Down,
    ]);
    // const possibleDirrections = [Direction.Up, Direction.Down];
    for (let diff = 1; diff <= this.distance; diff++) {
      for (let dirrection of this.possibleDirrections) {
        // const newY =
        //   dirrection == Direction.Up ? fromY + diff : fromY - diff;
        const [newX, newY] = this.calculateNewCoord(
          fromX,
          fromY,
          diff,
          dirrection
        );

        if (availableDirections.has(dirrection)) {
          if (this.isCoordInvalid(newX, newY, squares.length)) {
            availableDirections.delete(dirrection);
          } else {
            const possibleMove = squares[newX][newY];
            const fromCell = squares[fromX][fromY];
            const color = fromCell?.getPiece()?.color;
            if (this.moveToEmpty && possibleMove.isEmpty()) {
              // can move to empty square
              moves.push([newX, newY]);
            } else if (this.moveToKill && !possibleMove.isEmpty()) {
              const newLocationPieceColor = possibleMove.getPiece()!.color;
              if (newLocationPieceColor !== color) {
                // can move to enemy square
                moves.push([newX, newY]);
              }
              if (this.collision) {
                availableDirections.delete(dirrection);
              }
            }
          }
        }
        if (availableDirections.size === 0) {
          diff = this.distance + 1;
        }
      }
    }

    return moves;
  }
}
