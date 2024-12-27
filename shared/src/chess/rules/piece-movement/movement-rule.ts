import { Turn } from "../../turn";
import { GetPiece } from "../../get-piece";
import { Affects } from "../../affect.types";
import { MovementRules } from "./movement-rules.const";

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
  name: MovementRules;
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Direction[];
  speed: number;
};

export type AvailableMove = [number, number, affected?: Affects];

export abstract class MovementRule {
  constructor(
    public name: MovementRules,
    protected moveToEmpty: boolean,
    protected moveToKill: boolean,
    protected collision: boolean, // true - will move until first enemy, false - will jump like horse
    protected distance: number,
    protected directions: Set<Direction>,
    protected speed: number
  ) {}

  getMeta() {
    return {
      name: this.name,
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
    getPiece: GetPiece,
    turns: Turn[],
    size: number
  ): AvailableMove[];
}
