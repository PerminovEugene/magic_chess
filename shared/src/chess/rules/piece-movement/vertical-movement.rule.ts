import { AvailableMove, Direction } from "./movement-rule";
import {
  directionToVector,
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";

export class VerticalMovementRule extends StraightMovementRule {
  constructor({
    name,
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed = 1,
  }: StraightMovementRuleConfig) {
    super(
      name,
      moveToEmpty,
      moveToKill,
      collision,
      distance,
      directions,
      speed
    );
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
