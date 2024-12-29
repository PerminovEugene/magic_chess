import { Action, MovementRule } from "./rules/piece-movement/movement-rule";
import {
  PostMovementRule,
  PostMovementRuleMeta,
} from "./rules/piece-post-movement/post-movement.rule";
import {
  ActivatePositions,
  DiagonalMovementRule,
  HorizontalMovementRule,
  isTransformingRuleMeta,
  KnightMovementRule,
  PositionSpecificMovementRule,
  TransformationOnPositionRule,
  VerticalMovementRule,
} from "./rules/movement-rules";
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

    let uniqRulesParams: any = {};
    if (isPositionSpecificMovementRuleMeta(ruleMeta)) {
      const activatePositions: ActivatePositions = {};
      if (activatePositions.x) {
        activatePositions.x = new Set(activatePositions.x);
      }
      if (activatePositions.y) {
        activatePositions.y = new Set(activatePositions.y);
      }
      uniqRulesParams.activatePositions = activatePositions;
    }
    const ruleInstance = new r({
      ...ruleMeta,
      directions: new Set(ruleMeta.directions),
      ...uniqRulesParams,
    });
    this.movementRules.set(ruleMeta.name, ruleInstance);
  }
  public addMovementRules(rulesMeta: RuleMeta[]) {
    rulesMeta.forEach((ruleMeta) => {
      if (!this.movementRules.has(ruleMeta.name)) {
        this.addMovementRule(ruleMeta);
      }
    });
  }

  public addPostMovementRule(ruleMeta: PostMovementRuleMeta) {
    if (isTransformingRuleMeta(ruleMeta)) {
      const ruleInstance = new postMovementRulesMapper[ruleMeta.name](ruleMeta);
      this.postMovementRules.set(ruleMeta.name, ruleInstance);
    } else {
      throw new Error("Invalid post movement rule");
    }
  }
  public addPostMovementRules(rulesMeta: PostMovementRuleMeta[]) {
    rulesMeta.forEach((ruleMeta) => {
      if (!this.postMovementRules.has(ruleMeta.name)) {
        this.addPostMovementRule(ruleMeta);
      }
    });
  }

  public getAvailableMoves(
    ruleName: MovementRules,
    x: number,
    y: number,
    getPiece: GetPiece,
    turns: Turn[],
    size: number
  ) {
    const ruleInstance = this.movementRules.get(ruleName);
    if (!ruleInstance) {
      throw new Error(`Movement rule not found ${ruleName}`);
    }
    return ruleInstance.availableMoves(x, y, getPiece, turns, size);
  }

  public addPostMovementCorrections(
    rule: PostMovementRules,
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
