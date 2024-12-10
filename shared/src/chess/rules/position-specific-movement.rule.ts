import { Direction, MovementRuleMeta } from "./movement-rule";
import {
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";
import { Coordinate } from "../types";

/*
  Allows to setup specific positions for activation of the rule, like pawn first double step from initial line
  if provided x OR y then second coordinate can be any
  if provided both of them then any combination of both of them then both lines works as activation postion
*/
export type ActivatePositions = {
  x?: Set<number>;
  y?: Set<number>;
};
export type ActivatePositionsMeta = {
  x?: number[];
  y?: number[];
};

export type PositionSpecificMovementRuleConfig = StraightMovementRuleConfig & {
  activatePositions: ActivatePositions;
};

export type PositionSpecificMovementRuleMeta = {
  activatePositions: ActivatePositionsMeta;
} & MovementRuleMeta;

export class PositionSpecificMovementRule extends StraightMovementRule {
  private activatePositions: ActivatePositions;
  constructor({
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
    activatePositions,
  }: PositionSpecificMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions, speed);
    this.activatePositions = activatePositions;
  }

  protected possibleDirrections = [
    Direction.Up,
    Direction.Down,
    Direction.Left,
    Direction.Right,
  ];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): Coordinate => {
    let calculatedX = x;

    if (this.activatePositions.x?.has(x)) {
      if (dirrection === Direction.Left) {
        calculatedX = x - diff;
      } else if (dirrection === Direction.Right) {
        calculatedX = x + diff;
      }
    }
    let calculatedY = y;
    if (this.activatePositions.y?.has(y)) {
      if (dirrection === Direction.Down) {
        calculatedY = y + diff;
      } else if (dirrection === Direction.Up) {
        calculatedY = y - diff;
      }
    }

    return [calculatedX, calculatedY];
  };

  getMeta(): PositionSpecificMovementRuleMeta {
    const xPositions =
      this.activatePositions.x && Array.from(this.activatePositions.x);
    const yPositions =
      this.activatePositions.x && Array.from(this.activatePositions.x);
    return {
      activatePositions: {
        ...(xPositions ? { x: xPositions } : {}),
        ...(yPositions ? { y: yPositions } : {}),
      },
      ...super.getMeta(),
    };
  }
}
