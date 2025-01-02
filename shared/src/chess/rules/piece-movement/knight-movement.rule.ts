import { Direction } from "./movement-rule";
import { Action } from "../../affect/affect.types";
import {
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";
import { Coordinate } from "../../coordinate";
import { AffectType } from "../../affect/affect.types";
import { buildMoveAffect, markAsUserSelected } from "../../affect/affect.utils";

/**
 *           upLeft up
 *        left           upRight
 *                x y
 *     downleft            right
 *           down     downRight
 */

const actionMap: {
  [key in Direction]: (x: number, y: number, diff: number) => Coordinate;
} = {
  [Direction.UpRight]: (x: number, y: number, diff: number) => {
    return [x + diff + 1, y - diff];
  },
  [Direction.UpLeft]: (x: number, y: number, diff: number) => {
    return [x - diff, y - diff - 1];
  },
  [Direction.DownRight]: (x: number, y: number, diff: number) => {
    return [x + diff, y + diff + 1];
  },
  [Direction.DownLeft]: (x: number, y: number, diff: number) => {
    return [x - diff - 1, y + diff];
  },
  [Direction.Up]: (x: number, y: number, diff: number) => {
    return [x + diff, y - diff - 1];
  },
  [Direction.Down]: (x: number, y: number, diff: number) => {
    return [x - diff, y + diff + 1];
  },
  [Direction.Right]: (x: number, y: number, diff: number) => {
    return [x + diff + 1, y + diff];
  },
  [Direction.Left]: (x: number, y: number, diff: number) => {
    return [x - diff - 1, y - 1];
  },
};

export class KnightMovementRule extends StraightMovementRule {
  constructor({
    id,
    name,
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
  }: StraightMovementRuleConfig) {
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
  }

  protected possibleDirrections = [
    Direction.UpRight,
    Direction.UpLeft,
    Direction.DownRight,
    Direction.DownLeft,
    Direction.Up,
    Direction.Down,
    Direction.Right,
    Direction.Left,
  ];
  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction
  ): Action => {
    return [
      markAsUserSelected(
        buildMoveAffect([x, y], actionMap[dirrection](x, y, diff))
      ),
    ];
  };
}
