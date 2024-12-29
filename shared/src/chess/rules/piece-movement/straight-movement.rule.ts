import { Turn } from "../../turn";
import { Coordinate } from "../../coordinate";
import { Action, Direction, MovementRule } from "./movement-rule";
import { GetPiece } from "../../get-piece";
import { Affect, AffectType, KillAffect } from "../../affect/affect.types";
import { MovementRules } from "./movement-rules.const";
import { buildKillAffect } from "../../affect/affect.utils";

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
  ) => Action;

  protected isCoordInvalid(x: number, y: number, size: number) {
    return x >= size || x < 0 || y >= size || y < 0;
  }

  public availableMoves(
    fromX: number,
    fromY: number,
    getPiece: GetPiece,
    turns: Turn[],
    size: number
  ): Action[] {
    const moves: Action[] = [];
    let availableDirections = new Set<Direction>(this.possibleDirrections);

    for (let diff = this.speed; diff <= this.distance; diff += this.speed) {
      for (let dirrection of this.directions) {
        if (availableDirections.has(dirrection)) {
          const affects = this.calculateNewCoord(
            fromX,
            fromY,
            diff,
            dirrection,
            turns
          );
          if (!affects.length) {
            availableDirections.delete(dirrection);
            continue;
          }
          // const [newX, newY] = availableMove;
          const moveAffect = affects.find((a) => a.type === AffectType.move);

          if (!moveAffect) {
            throw new Error("Move affect not found");
          }
          const [newX, newY] = moveAffect.to;

          if (this.isCoordInvalid(newX, newY, size)) {
            // todo remove magic
            availableDirections.delete(dirrection);
          } else {
            const toPiece = getPiece(newX, newY);
            const fromPiece = getPiece(fromX, fromY);

            if (!fromPiece) {
              throw new Error("Not found piece at from location");
            }

            if (this.moveToEmpty && !toPiece) {
              // can move to empty square
              moves.push(affects);
            } else if (toPiece) {
              const newLocationPieceColor = toPiece.color;

              if (
                this.moveToKill &&
                newLocationPieceColor !== fromPiece.color
              ) {
                const killAffect = buildKillAffect(moveAffect.to);
                // affects.push(killAffect);
                moves.push([killAffect, ...affects]);
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
