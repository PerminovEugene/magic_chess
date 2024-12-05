import { MovementRule } from "./rules";

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

export abstract class Piece {
  constructor(
    public type: PieceType,
    public color: Color,
    public movementRules: MovementRule[]
  ) {}
}

export class Pawn extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.Pawn, color, movementRules);
  }
}
export class King extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.King, color, movementRules);
  }
}
export class Queen extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.Queen, color, movementRules);
  }
}
export class Rook extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.Rook, color, movementRules);
  }
}
export class Knight extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.Knight, color, movementRules);
  }
}
export class Bishop extends Piece {
  constructor(color: Color, movementRules = []) {
    super(PieceType.Bishop, color, movementRules);
  }
}
