import { Color } from "../../color";
import { Action } from "../piece-movement/movement-rule";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import { PieceType } from "../../piece/piece.constants";

export abstract class PostMovementRule {
  constructor(public name: PostMovementRules) {}
  public abstract updateMovesAffects(
    moves: Action[],
    pieceType: PieceType
  ): Action[];
  public abstract getMeta(): any;
}

export type PostMovementRuleMeta = {
  name: PostMovementRules;
  color: Color;
  maxCharges: number;
};
