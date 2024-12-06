import { Direction } from "./rules";
import {
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
  }: StraightMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions);
  }

  protected possibleDirrections = [Direction.Up, Direction.Down];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): [number, number] => {
    return [x, dirrection == Direction.Up ? y - diff : y + diff];
  };
}
