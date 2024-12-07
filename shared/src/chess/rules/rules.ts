import { Cell } from "../cell";

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

export type RuleMeta = {
  name: string;
  moveToEmpty: boolean;
  moveToKill: boolean;
  collision: boolean;
  distance: number;
  directions: Direction[];
};

export abstract class MovementRule {
  constructor(
    // protected name: MovementRuleName,
    protected moveToEmpty: boolean,
    protected moveToKill: boolean,
    protected collision: boolean, // true - will move until first enemy, false - will jump like horse
    protected distance: number,
    protected directions: Set<Direction>
  ) {}

  getMeta() {
    return {
      name: this.constructor.name,
      moveToEmpty: this.moveToEmpty,
      moveToKill: this.moveToKill,
      collision: this.collision,
      distance: this.distance,
      directions: this.directions,
    };
  }

  abstract availableMoves(
    fromX: number,
    fromY: number,
    squares: Cell[][]
  ): [number, number][];
}

// export const movementRules: Map<MovementRuleName, MovementRule> = new Map([
//   [
//     MovementRuleName.HorizontalMovementRule,
//     {
//       name: MovementRuleName.HorizontalMovementRule,
//       availableMoves: (
//         fromX: number,
//         fromY: number,
//         size: number,
//         squares: Cell[][]
//       ) => {
//         const movements = [];

//         return movements;
//       },
//     },
//   ],
// ]);
