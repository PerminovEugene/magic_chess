import { PostMovementRuleMeta } from "../post-movement.types";
import { TransformationOnPositionRuleMeta } from "./transforming-on-position.types";

export function isTransformingRuleMeta(
  rule: PostMovementRuleMeta
): rule is TransformationOnPositionRuleMeta {
  return (
    (rule as TransformationOnPositionRuleMeta).maxCharges !== undefined &&
    ((rule as TransformationOnPositionRuleMeta).triggerOnX !== undefined ||
      (rule as TransformationOnPositionRuleMeta).triggerOnY !== undefined)
  );
}
