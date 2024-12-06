import { Direction } from "./rules";
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
  }: StraightMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions);
  }

  protected possibleDirrections = [Direction.Left, Direction.Right];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): [number, number] => {
    return [dirrection == Direction.Left ? x - diff : x + diff, y];
  };
}
