import { MovementRule } from "./rules/piece-movement/movement-rule";
import { Action } from "./affect/affect.types";
import { PostMovementRule } from "./rules/piece-post-movement/post-movement.rule";
import {
  ActivatePositions,
  DiagonalMovementRule,
  HorizontalMovementRule,
  KnightMovementRule,
  PositionSpecificMovementRule,
  TransformationOnPositionRule,
  VerticalMovementRule,
} from "./rules/piece-movement";
import { CastlingMovementRule } from "./rules/piece-movement/castling.rule";
import { RuleMeta } from "./rules/piece-movement/rules";
import { TakeOnThePassMovementRule } from "./rules/piece-movement/take-on-the-pass.rule";
import { isPositionSpecificMovementRuleMeta } from "./rules/piece-movement/rules.typeguards";
import {
  MovementRules,
  PostMovementRules,
} from "./rules/piece-movement/movement-rules.const";
import { GetPiece } from "./get-piece";
import { Turn } from "./turn";
import { PieceType } from "./piece/piece.constants";
import { Entity } from "./entity";
import { PostMovementRuleMeta } from "./rules/piece-post-movement/post-movement.types";
import { isTransformingRuleMeta } from "./rules/piece-post-movement/transforming-on-position/transforming-on-position.typeguard";

const rulesMapper = {
  [MovementRules.VerticalMovementRule]: VerticalMovementRule,
  [MovementRules.HorizontalMovementRule]: HorizontalMovementRule,
  [MovementRules.DiagonalMovementRule]: DiagonalMovementRule,
  [MovementRules.KnightMovementRule]: KnightMovementRule,
  [MovementRules.PositionSpecificMovementRule]: PositionSpecificMovementRule,
  [MovementRules.TakeOnThePassMovementRule]: TakeOnThePassMovementRule,
  [MovementRules.CastlingMovementRule]: CastlingMovementRule,
};
const postMovementRulesMapper = {
  [PostMovementRules.TransformationOnPositionRule]:
    TransformationOnPositionRule,
};

export class RulesEngine {
  private movementRules = new Map<string, MovementRule>();
  private postMovementRules = new Map<string, PostMovementRule>();

  public addMovementRule(ruleMeta: RuleMeta) {
    const r = rulesMapper[ruleMeta.name];

    const uniqRulesParams: {
      activatePositions?: ActivatePositions;
    } = {};
    if (isPositionSpecificMovementRuleMeta(ruleMeta)) {
      const activatePositions: ActivatePositions = {};
      if (ruleMeta.activatePositions.x) {
        activatePositions.x = new Set(ruleMeta.activatePositions.x);
      }
      if (ruleMeta.activatePositions.y) {
        activatePositions.y = new Set(ruleMeta.activatePositions.y);
      }
      uniqRulesParams.activatePositions = activatePositions;
    }
    const ruleInstance = new r({
      ...ruleMeta,
      directions: new Set(ruleMeta.directions),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(uniqRulesParams as any),
    });
    this.movementRules.set(ruleMeta.id, ruleInstance);
  }
  public addMovementRules(rulesMeta: RuleMeta[]) {
    rulesMeta.forEach((ruleMeta) => {
      if (!this.movementRules.has(ruleMeta.id)) {
        this.addMovementRule(ruleMeta);
      }
    });
  }

  public addPostMovementRule(ruleMeta: PostMovementRuleMeta) {
    if (isTransformingRuleMeta(ruleMeta)) {
      const ruleInstance = new postMovementRulesMapper[ruleMeta.name](ruleMeta);
      this.postMovementRules.set(ruleMeta.id, ruleInstance);
    } else {
      throw new Error("Invalid post movement rule");
    }
  }
  public addPostMovementRules(rulesMeta: PostMovementRuleMeta[]) {
    rulesMeta.forEach((ruleMeta) => {
      if (!this.postMovementRules.has(ruleMeta.id)) {
        this.addPostMovementRule(ruleMeta);
      }
    });
  }

  public getAvailableMoves(
    ruleId: Entity["id"],
    x: number,
    y: number,
    getPiece: GetPiece,
    turns: Turn[],
    size: number
  ) {
    const ruleInstance = this.movementRules.get(ruleId);
    if (!ruleInstance) {
      throw new Error(`Movement rule not found ${ruleId}`);
    }
    return ruleInstance.availableMoves(x, y, getPiece, turns, size);
  }

  public addPostMovementCorrections(
    rule: PostMovementRule["id"],
    sourceMoves: Action[],
    pieceType: PieceType
  ) {
    const ruleInstance = this.postMovementRules.get(rule);
    if (!ruleInstance) {
      throw new Error(`Post movement rule not found ${rule}`);
    }
    return ruleInstance.updateMovesAffects(sourceMoves, pieceType);
  }
}
