import { AffectType } from "../../affect.types";
import { buildMoveAffect, markAsUserSelected } from "../../affect.utils";
import { Action, Direction } from "./movement-rule";
import {
  directionToVector,
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";

export class HorizontalMovementRule extends StraightMovementRule {
  constructor({
    name,
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
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

  protected possibleDirrections = [Direction.Left, Direction.Right];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): Action => {
    return [
      markAsUserSelected(
        buildMoveAffect([x, y], directionToVector(dirrection, x, y, diff))
      ),
    ];
  };
}
