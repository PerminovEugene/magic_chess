import { Color } from "../color";
import { PieceType } from "./piece.constants";
import { UUID } from "crypto";

export type PieceMeta = {
  id: UUID;
  type: PieceType;
  color: Color;
  movementRulesMeta: UUID[];
  postMovementRulesMeta?: UUID[];
};
