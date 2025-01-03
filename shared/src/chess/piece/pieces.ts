import { Color } from "../color";
import { Piece } from "./piece";
import { PieceType } from "./piece.constants";
import { Entity } from "../entity";

export class Pawn extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [], //ids should be
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.Pawn, color, movementRules, postMovementRules);
  }
}
export class King extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [],
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.King, color, movementRules, postMovementRules);
  }
}
export class Queen extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [],
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.Queen, color, movementRules, postMovementRules);
  }
}
export class Rook extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [],
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.Rook, color, movementRules, postMovementRules);
  }
}
export class Knight extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [],
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.Knight, color, movementRules, postMovementRules);
  }
}
export class Bishop extends Piece {
  constructor(
    color: Color,
    movementRules: Entity["id"][] = [],
    postMovementRules: Entity["id"][] = []
  ) {
    super(PieceType.Bishop, color, movementRules, postMovementRules);
  }
}
