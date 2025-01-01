import { CastlingMovementRuleMeta } from "./castling.rule";
import { MovementRuleMeta } from "./movement-rule";
import { PositionSpecificMovementRuleMeta } from "./position-specific-movement.rule";

export type RuleMeta =
  | MovementRuleMeta
  | PositionSpecificMovementRuleMeta
  | CastlingMovementRuleMeta;
