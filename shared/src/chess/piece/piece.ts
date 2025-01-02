import { Color } from "../color";
import { PieceType } from "./piece.constants";
import { UUID } from "crypto";

export abstract class Piece {
  constructor(
    public type: PieceType,
    public color: Color,
    public movementRules: UUID[],
    public postMovementRules?: UUID[]
  ) {}

  getMeta() {
    return {
      type: this.type,
      color: this.color,
      rules: this.movementRules,
      postMovementRulesMeta: this.postMovementRules,
    };
  }
}
