import { Color } from "../../color";
import { Entity } from "../../entity";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import { TransformationOnPositionRuleMeta } from "./transforming-on-position/transforming-on-position.types";

export type PostMovementRuleMeta = {
  name: PostMovementRules;
  color: Color;
  maxCharges: number;
} & Entity &
  TransformationOnPositionRuleMeta;
