import { Turn } from "../../turn";
import { GetPiece } from "../../get-piece";
import { Action } from "../../affect/affect.types";
import { MovementRules } from "./movement-rules.const";
import { UUID } from "crypto";

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
  id: UUID;
  name: MovementRules;
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Direction[];
  speed: number;
};

export abstract class MovementRule {
  constructor(
    public id: UUID,
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
      id: this.id,
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
  ): Action[];
}
