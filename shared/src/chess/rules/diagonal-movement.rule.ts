import { Coordinate } from "../types";
import { Direction } from "./movement-rule";
import {
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";

export class DiagonalMovementRule extends StraightMovementRule {
  constructor({
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed = 1,
  }: StraightMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions, speed);
  }

  protected possibleDirrections = [
    Direction.UpLeft,
    Direction.UpRight,
    Direction.DownLeft,
    Direction.DownRight,
  ];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): Coordinate => {
    if (dirrection == Direction.UpLeft) {
      return [x - diff, y - diff];
    }
    if (dirrection == Direction.UpRight) {
      return [x + diff, y - diff];
    }
    if (dirrection == Direction.DownLeft) {
      return [x - diff, y + diff];
    }
    if (dirrection == Direction.DownRight) {
      return [x + diff, y + diff];
    }
    throw new Error("Invalid direction");
  };
}
