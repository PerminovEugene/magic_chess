import { UUID } from "crypto";
import { PieceMeta } from "../piece/piece.types";
import { RuleMeta } from "../rules";
import { PostMovementRuleMeta } from "../rules/piece-post-movement/post.movement.types";

export type BoardMeta = {
  cellsMeta: (UUID | undefined)[][];
  movementRules: RuleMeta[];
  postMovementRules: PostMovementRuleMeta[];
  pieceMeta: PieceMeta[];
};
