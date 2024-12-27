import { Color } from "../../color";
import { AvailableMove } from "../piece-movement/movement-rule";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import { PieceType } from "../../piece.consts";

export abstract class PostMovementRule {
  constructor(public name: PostMovementRules) {}
  public abstract updateMovesAffects(
    moves: AvailableMove[],
    pieceType: PieceType
  ): AvailableMove[];
  public abstract getMeta(): any;
}

export type PostMovementRuleMeta = {
  name: PostMovementRules;
  color: Color;
  maxCharges: number;
};
