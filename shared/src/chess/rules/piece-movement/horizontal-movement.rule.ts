import { AvailableMove, Direction } from "./movement-rule";
import {
  directionToVector,
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
  ): AvailableMove => {
    return directionToVector(dirrection, x, y, diff);
  };
}
