import { Turn } from "../../turn";
import { Coordinate } from "../../coordinate";
import { AvailableMove, Direction, MovementRule } from "./movement-rule";
import { GetPiece } from "../../get-piece";
import { Affect, AffectType } from "../../affect.types";
import { MovementRules } from "./movement-rules.const";

export type StraightMovementRuleConfig = {
  name: MovementRules;
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
    mname: MovementRules,
    moveToEmpty: boolean,
    moveToKill: boolean,
    collision: boolean, // true - will move until first enemy, false - will jump like horse
    distance: number,
    directions: Set<Direction>,
    speed: number
  ) {
    super(
      mname,
      moveToEmpty,
      moveToKill,
      collision,
      distance,
      directions,
      speed
    );
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
    getPiece: GetPiece,
    turns: Turn[],
    size: number
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

          if (this.isCoordInvalid(newX, newY, size)) {
            // todo remove magic
            availableDirections.delete(dirrection);
          } else {
            const toPiece = getPiece(newX, newY);
            const fromPiece = getPiece(fromX, fromY);

            if (this.moveToEmpty && !toPiece) {
              // can move to empty square
              moves.push(availableMove);
            } else if (toPiece) {
              if (!fromPiece) {
                throw new Error("Not found piece at from location");
              }

              const newLocationPieceColor = toPiece.color;

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
