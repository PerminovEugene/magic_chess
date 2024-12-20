import { Cell } from "../../cell";
import { Turn } from "../../game";
import { Coordinate } from "../../coordinate";
import {
  Affect,
  AffectType,
  AvailableMove,
  Direction,
  MovementRule,
} from "./movement-rule";

export type StraightMovementRuleConfig = {
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Set<Direction>;
  speed: number;
};

const mapDirectionToVector = {
  [Direction.UpLeft]: (x: number, y: number, diff: number): Coordinate => [
    x - diff,
    y - diff,
  ],
  [Direction.UpRight]: (x: number, y: number, diff: number): Coordinate => [
    x + diff,
    y - diff,
  ],
  [Direction.DownLeft]: (x: number, y: number, diff: number): Coordinate => [
    x - diff,
    y + diff,
  ],
  [Direction.DownRight]: (x: number, y: number, diff: number): Coordinate => [
    x + diff,
    y + diff,
  ],
  [Direction.Up]: (x: number, y: number, diff: number): Coordinate => [
    x,
    y - diff,
  ],
  [Direction.Down]: (x: number, y: number, diff: number): Coordinate => [
    x,
    y + diff,
  ],
  [Direction.Right]: (x: number, y: number, diff: number): Coordinate => [
    x + diff,
    y,
  ],
  [Direction.Left]: (x: number, y: number, diff: number): Coordinate => [
    x - diff,
    y,
  ],
};

export function directionToVector(
  direction: Direction,
  x: number,
  y: number,
  diff: number
): Coordinate {
  return mapDirectionToVector[direction](x, y, diff);
}

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
    dirrection: Direction,
    turns: Turn[]
  ) => AvailableMove | null;

  protected isCoordInvalid(x: number, y: number, size: number) {
    return x >= size || x < 0 || y >= size || y < 0;
  }

  private getKillAffect(toX: number, toY: number): Affect {
    return {
      type: AffectType.kill,
      from: [toX, toY],
    };
  }

  public availableMoves(
    fromX: number,
    fromY: number,
    squares: Cell[][],
    turns: Turn[]
  ): AvailableMove[] {
    const moves: AvailableMove[] = [];
    let availableDirections = new Set<Direction>(this.possibleDirrections);

    for (let diff = this.speed; diff <= this.distance; diff += this.speed) {
      for (let dirrection of this.directions) {
        if (availableDirections.has(dirrection)) {
          const availableMove = this.calculateNewCoord(
            fromX,
            fromY,
            diff,
            dirrection,
            turns
          );
          if (!availableMove) {
            availableDirections.delete(dirrection);
            continue;
          }
          const [newX, newY] = availableMove;

          if (this.isCoordInvalid(newX, newY, squares.length)) {
            availableDirections.delete(dirrection);
          } else {
            const possibleMove = squares[newY][newX];
            const fromCell = squares[fromY][fromX];

            if (this.moveToEmpty && possibleMove.isEmpty()) {
              // can move to empty square
              moves.push(availableMove);
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
                const killAffect = this.getKillAffect(newX, newY);
                availableMove.push([killAffect]);
                moves.push(availableMove);
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
