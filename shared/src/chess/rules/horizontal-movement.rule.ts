import { Coordinate } from "../types";
import { Direction } from "./movement-rule";
import {
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";

export class HorizontalMovementRule extends StraightMovementRule {
  constructor({
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
  }: StraightMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions, speed);
  }

  protected possibleDirrections = [Direction.Left, Direction.Right];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): Coordinate => {
    return [dirrection == Direction.Left ? x - diff : x + diff, y];
  };
}
