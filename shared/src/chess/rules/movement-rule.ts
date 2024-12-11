import { Cell } from "../cell";
import { Turn } from "../game";
import { Coordinate } from "../types";

export enum Direction {
  Up = "Up",
  UpLeft = "UpLeft",
  UpRight = "UpRight",
  Down = "Down",
  DownLeft = "DownLeft",
  DownRight = "DownRight",
  Left = "Left",
  Right = "Right",
}

export type MovementRuleMeta = {
  name: string;
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Direction[];
  speed: number;
};

export enum AffectType {
  move = "move",
  kill = "kill",
}
export type Affect = {
  from: Coordinate;
  to?: Coordinate;
  type: AffectType;
};
export type AvailableMove = [number, number, affected?: Affect[]];

export abstract class MovementRule {
  constructor(
    // protected name: MovementRuleName,
    protected moveToEmpty: boolean,
    protected moveToKill: boolean,
    protected collision: boolean, // true - will move until first enemy, false - will jump like horse
    protected distance: number,
    protected directions: Set<Direction>,
    protected speed: number
  ) {}

  getMeta() {
    return {
      name: this.constructor.name,
      moveToEmpty: this.moveToEmpty,
      moveToKill: this.moveToKill,
      collision: this.collision,
      distance: this.distance,
      directions: Array.from(this.directions),
      speed: this.speed,
    };
  }

  abstract availableMoves(
    fromX: number,
    fromY: number,
    squares: Cell[][],
    turns: Turn[]
  ): AvailableMove[];
}
