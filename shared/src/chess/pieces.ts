import { Color } from "./color";
import { Piece } from "./piece";
import { PieceType } from "./piece.consts";
import {
  MovementRules,
  PostMovementRules,
} from "./rules/piece-movement/movement-rules.const";

export class Pawn extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [], //ids should be
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.Pawn, color, movementRules, postMovementRules);
  }
}
export class King extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [],
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.King, color, movementRules, postMovementRules);
  }
}
export class Queen extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [],
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.Queen, color, movementRules, postMovementRules);
  }
}
export class Rook extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [],
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.Rook, color, movementRules, postMovementRules);
  }
}
export class Knight extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [],
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.Knight, color, movementRules, postMovementRules);
  }
}
export class Bishop extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRules[] = [],
    postMovementRules: PostMovementRules[] = []
  ) {
    super(PieceType.Bishop, color, movementRules, postMovementRules);
  }
}
