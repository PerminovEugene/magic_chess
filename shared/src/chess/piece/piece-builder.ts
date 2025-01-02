import { PieceMeta } from "./piece.types";
import { PieceType } from "./piece.constants";
import { Pawn, Bishop, Knight, Rook, Queen, King } from "./pieces";

export function buildPieceByMeta(meta: PieceMeta) {
  const c = mapper[meta.type as PieceType];
  return new c(
    meta.color,
    meta.movementRulesMeta.map((ruleMetaId) => ruleMetaId),
    meta.postMovementRulesMeta?.map((ruleMetaId) => ruleMetaId)
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
