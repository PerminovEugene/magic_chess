import { Color } from "./color";
import { PieceType } from "./piece.consts";
import { RuleMeta } from "./rules/piece-movement/rules";
import { PostMovementRuleMeta } from "./rules/piece-post-movement/post-movement.rule";

export type PieceMeta = {
  type: PieceType;
  color: Color;
  rules: RuleMeta[];
  postMovementRulesMeta?: PostMovementRuleMeta[];
};
