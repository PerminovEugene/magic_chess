import { Cell } from "../cell";
import { Coordinate } from "../types";
import { Direction, MovementRule } from "./movement-rule";

export type StraightMovementRuleConfig = {
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Set<Direction>;
  speed: number;
};
export abstract class StraightMovementRule extends MovementRule {
  constructor(
    moveToEmpty: boolean,
    moveToKill: boolean,
    collision: boolean, // true - will move until first enemy, false - will jump like horse
    distance: number,
    directions: Set<Direction>,
    speed: number
  ) {
    super(moveToEmpty, moveToKill, collision, distance, directions, speed);
  }

  protected abstract possibleDirrections: Direction[];
  protected abstract calculateNewCoord: (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ) => Coordinate;

  protected isCoordInvalid(x: number, y: number, size: number) {
    return x >= size || x < 0 || y >= size || y < 0;
  }

  public availableMoves(
    fromX: number,
    fromY: number,
    squares: Cell[][]
  ): Coordinate[] {
    const moves: Coordinate[] = [];
    let availableDirections = new Set<Direction>(this.possibleDirrections);

    for (let diff = this.speed; diff <= this.distance; diff += this.speed) {
      for (let dirrection of this.directions) {
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
            const possibleMove = squares[newY][newX];
            const fromCell = squares[fromY][fromX];

            if (this.moveToEmpty && possibleMove.isEmpty()) {
              // can move to empty square
              moves.push([newX, newY]);
            } else if (!possibleMove.isEmpty()) {
              const fromPiece = fromCell?.getPiece();

              if (!fromPiece) {
                throw new Error("Not found piece at from location");
              }

              const newLocationPieceColor = possibleMove.getPiece()!.color;

              if (
                this.moveToKill &&
                newLocationPieceColor !== fromPiece.color
              ) {
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
          diff = this.distance + 1; // end search, nowhere to go
        }
      }
    }

    return moves;
  }
}
