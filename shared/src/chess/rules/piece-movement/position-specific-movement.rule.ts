import { Action, Direction, MovementRuleMeta } from "./movement-rule";
import {
  directionToVector,
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";
import { Turn } from "../../turn";
import { MovementRules } from "./movement-rules.const";
import { AffectType } from "../../affect/affect.types";
import { buildMoveAffect, markAsUserSelected } from "../../affect/affect.utils";

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
  protected activatePositions: ActivatePositions;
  constructor({
    id,
    name,
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
    activatePositions,
  }: PositionSpecificMovementRuleConfig) {
    super(
      id,
      name,
      moveToEmpty,
      moveToKill,
      collision,
      distance,
      directions,
      speed
    );
    this.activatePositions = activatePositions;
    if (
      activatePositions.x &&
      !directions.has(Direction.Left) &&
      !directions.has(Direction.Right) &&
      !directions.has(Direction.UpRight) &&
      !directions.has(Direction.UpLeft) &&
      !directions.has(Direction.DownRight) &&
      !directions.has(Direction.DownLeft)
    ) {
      throw new Error(
        "PositionSpecificMovementRule: x position provided but no horizontal directions"
      );
    }
    if (
      activatePositions.y &&
      !directions.has(Direction.Up) &&
      !directions.has(Direction.Down) &&
      !directions.has(Direction.UpRight) &&
      !directions.has(Direction.UpLeft) &&
      !directions.has(Direction.DownRight) &&
      !directions.has(Direction.DownLeft)
    ) {
      throw new Error(
        "PositionSpecificMovementRule: y position provided but no vertical directions"
      );
    }
  }

  protected possibleDirrections = [
    Direction.Up,
    Direction.Down,
    Direction.Left,
    Direction.Right,
    Direction.DownLeft,
    Direction.UpLeft,
    Direction.UpRight,
    Direction.DownRight,
  ];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction,
    _: Turn[]
  ): Action => {
    if (this.activatePositions.y?.has(y) || this.activatePositions.x?.has(x)) {
      return [
        markAsUserSelected(
          buildMoveAffect([x, y], directionToVector(dirrection, x, y, diff))
        ),
      ];
    }
    return [];
  };

  getMeta(): PositionSpecificMovementRuleMeta {
    const xPositions =
      this.activatePositions.x && Array.from(this.activatePositions.x);
    const yPositions =
      this.activatePositions.y && Array.from(this.activatePositions.y);
    return {
      activatePositions: {
        ...(xPositions ? { x: xPositions } : {}),
        ...(yPositions ? { y: yPositions } : {}),
      },
      ...super.getMeta(),
    };
  }
}
