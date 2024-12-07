import { MovementRule, RuleMeta } from "./rules/rules";

export enum PieceType {
  Pawn = "Pawn",
  Bishop = "Bishop",
  Knight = "Knight",
  Rook = "Rook",
  Queen = "Queen",
  King = "King",
}
export enum Color {
  white = "white",
  black = "black",
}

export type PieceMeta = {
  type: PieceType;
  color: Color;
  rules: RuleMeta[];
};

export abstract class Piece {
  constructor(
    public type: PieceType,
    public color: Color,
    public movementRules: MovementRule[]
  ) {}

  getMeta() {
    return {
      type: this.type,
      color: this.color,
      rules: this.movementRules.map((rule) => rule.getMeta()),
    };
  }
}

export class Pawn extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.Pawn, color, movementRules);
  }
}
export class King extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.King, color, movementRules);
  }
}
export class Queen extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.Queen, color, movementRules);
  }
}
export class Rook extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.Rook, color, movementRules);
  }
}
export class Knight extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.Knight, color, movementRules);
  }
}
export class Bishop extends Piece {
  constructor(color: Color, movementRules: MovementRule[] = []) {
    super(PieceType.Bishop, color, movementRules);
  }
}
