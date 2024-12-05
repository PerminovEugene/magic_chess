import { Cell } from "./cell";

// export enum MovementRuleName {
//   DiagonalMovementRule = "DiagonalMovementRule",
//   VerticalMovementRule = "VerticalMovementRule",
//   HorizontalMovementRule = "HorizontalMovementRule",
// }

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

export abstract class MovementRule {
  constructor(
    // protected name: MovementRuleName,
    protected moveToEmpty: boolean,
    protected moveToKill: boolean,
    protected collistion: boolean, // true - will move until first enemy, false - will jump like horse
    protected distance: number,
    protected directions: Set<Direction>
  ) {}

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
