import { Coordinate } from "../types";
import { AvailableMove, Direction } from "./movement-rule";
import {
  directionToVector,
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";

export class VerticalMovementRule extends StraightMovementRule {
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

  protected possibleDirrections = [Direction.Up, Direction.Down];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): AvailableMove => {
    return directionToVector(dirrection, x, y, diff);
  };
}
