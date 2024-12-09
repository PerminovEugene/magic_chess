import { Dir } from "fs";
import { Direction } from "./rules";
import {
  StraightMovementRule,
  StraightMovementRuleConfig,
} from "./straight-movement.rule";
import { dir } from "console";

/**
 *           upLeft up
 *      left             upRight
 *     downleft           right
 *          down downRight
 *
 */

const actionMap: {
  [key in Direction]: (x: number, y: number, diff: number) => [number, number];
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
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
  }: StraightMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions);
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
  ): [number, number] => {
    return actionMap[dirrection](x, y, diff);
  };
}
