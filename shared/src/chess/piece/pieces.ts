import { Color } from "../color";
import { Piece } from "./piece";
import { PieceType } from "./piece.constants";
import { MovementRule, PostMovementRule } from "../rules";

export class Pawn extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [], //ids should be
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.Pawn, color, movementRules, postMovementRules);
  }
}
export class King extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [],
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.King, color, movementRules, postMovementRules);
  }
}
export class Queen extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [],
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.Queen, color, movementRules, postMovementRules);
  }
}
export class Rook extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [],
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.Rook, color, movementRules, postMovementRules);
  }
}
export class Knight extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [],
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.Knight, color, movementRules, postMovementRules);
  }
}
export class Bishop extends Piece {
  constructor(
    color: Color,
    movementRules: MovementRule["id"][] = [],
    postMovementRules: PostMovementRule["id"][] = []
  ) {
    super(PieceType.Bishop, color, movementRules, postMovementRules);
  }
}
