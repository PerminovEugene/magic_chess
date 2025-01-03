import { Action } from "../../affect/affect.types";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import { PieceType } from "../../piece/piece.constants";
import { UUID } from "crypto";
import { PostMovementRuleMeta } from "./post-movement.types";

export abstract class PostMovementRule {
  constructor(
    public readonly id: UUID,
    public name: PostMovementRules
  ) {}
  public abstract updateMovesAffects(
    moves: Action[],
    pieceType: PieceType
  ): Action[];
  public abstract getMeta(): PostMovementRuleMeta;
}
