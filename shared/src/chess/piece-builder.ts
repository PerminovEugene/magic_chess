import { PieceMeta } from "./piece.types";
import { PieceType } from "./piece.consts";
import { Pawn, Bishop, Knight, Rook, Queen, King } from "./pieces";
import { PostMovementRuleMeta, RuleMeta } from "./rules";

export function buildPieceByMeta(meta: PieceMeta) {
  const c = mapper[meta.type as PieceType];
  return new c(
    meta.color,
    meta.rules.map((ruleMeta: RuleMeta) => ruleMeta.name),
    meta.postMovementRulesMeta?.map(
      (ruleMeta: PostMovementRuleMeta) => ruleMeta.name
    )
    //   const r = rulesMapper[ruleMeta.name];

    //   let uniqRulesParams: any = {};
    //   if (isPositionSpecificMovementRuleMeta(ruleMeta)) {
    //     const activatePositions: ActivatePositions = {};
    //     if (activatePositions.x) {
    //       activatePositions.x = new Set(activatePositions.x);
    //     }
    //     if (activatePositions.y) {
    //       activatePositions.y = new Set(activatePositions.y);
    //     }
    //     uniqRulesParams.activatePositions = activatePositions;
    //   }
    //   return new r({
    //     ...ruleMeta,
    //     directions: new Set(ruleMeta.directions),
    //     ...uniqRulesParams,
    //   });
    // }),
    // meta.postMovementRulesMeta?.map((ruleMeta: PostMovementRuleMeta) => {
    //   if (isTransformingRuleMeta(ruleMeta)) {
    //     return new postMovementRulesMapper[ruleMeta.name](ruleMeta);
    //   }
    //   throw new Error("Invalid post movement rule");
    // })
  );
}

const mapper = {
  [PieceType.Pawn]: Pawn,
  [PieceType.Bishop]: Bishop,
  [PieceType.Knight]: Knight,
  [PieceType.Rook]: Rook,
  [PieceType.Queen]: Queen,
  [PieceType.King]: King,
};
