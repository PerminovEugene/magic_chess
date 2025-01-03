import { Color } from "../../../color";
import { Entity } from "../../../entity";
import { PieceType } from "../../../piece/piece.constants";
import { PostMovementRules } from "../../piece-movement/movement-rules.const";

export type TransformationOnPositionRuleConfig = {
  name: PostMovementRules;
  triggerOnX?: number;
  triggerOnY?: number;
  color: Color;
  // metadata for these pieces should be in board metadata
  possiblePiecesTypes: PieceType[];
  maxCharges: number;
} & Entity;
export type TransformationOnPositionRuleMeta = {
  name: PostMovementRules;
} & TransformationOnPositionRuleConfig;
