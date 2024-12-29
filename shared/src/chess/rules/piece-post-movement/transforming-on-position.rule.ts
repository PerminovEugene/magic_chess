import { PieceType } from "../../piece.consts";
import { Color } from "../../color";
import { Action } from "../piece-movement/movement-rule";
import { PostMovementRule, PostMovementRuleMeta } from "./post-movement.rule";
import { Affect, AffectType, MoveAffect } from "../../affect.types";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import {
  buildTransformationAffect,
  markAsUserSelected,
} from "../../affect.utils";

export type TransformationOnPositionRuleConfig = {
  name: PostMovementRules;
  triggerOnX?: number;
  triggerOnY?: number;
  color: Color;
  // metadata for these pieces should be in board metadata
  possiblePiecesTypes: PieceType[];
  maxCharges: number;
};
export type TransformationOnPositionRuleMeta = {
  name: PostMovementRules;
} & TransformationOnPositionRuleConfig;

export function isTransformingRuleMeta(
  rule: PostMovementRuleMeta
): rule is TransformationOnPositionRuleMeta {
  return (
    (rule as TransformationOnPositionRuleMeta).maxCharges !== undefined &&
    ((rule as TransformationOnPositionRuleMeta).triggerOnX !== undefined ||
      (rule as TransformationOnPositionRuleMeta).triggerOnY !== undefined)
  );
}

export class TransformationOnPositionRule extends PostMovementRule {
  private charges: number;

  constructor(private config: TransformationOnPositionRuleConfig) {
    super(config.name);
    if (config.triggerOnX === undefined && config.triggerOnY === undefined) {
      throw new Error("triggerOnX or triggerOnY are required");
    }
    this.charges = config.maxCharges;
  }

  isActive(x: number, y: number): boolean {
    return (
      this.charges > 0 &&
      (y === this.config.triggerOnY || x === this.config.triggerOnX)
    );
  }
  getPossiblePiecesTypes(): PieceType[] {
    return this.config.possiblePiecesTypes;
  }

  public updateMovesAffects(
    availableMoves: Action[],
    sourcePieceType: PieceType
  ): Action[] {
    const newMoves: Action[] = [];
    if (this.charges > 0) {
      for (let action of availableMoves) {
        const moveAffect = action.find(
          (affect) => affect.type === AffectType.move
        );
        if (moveAffect && moveAffect.to[1] === this.config.triggerOnY) {
          for (const destPieceType of this.config.possiblePiecesTypes) {
            // TODO here moves are wrong not all
            const transformationVariation = markAsUserSelected(
              buildTransformationAffect(
                moveAffect.to,
                destPieceType,
                sourcePieceType
              )
            );
            action.push(transformationVariation);
          }
        }
        newMoves.push(action);
      }
    }
    return newMoves;
  }

  addTransformationVariation(
    move: MoveAffect,
    type: PieceType,
    sourcePieceType: PieceType
  ): Action {
    const newMove: Action = [
      move,
      buildTransformationAffect(move.to, type, sourcePieceType),
    ];
    return newMove;
  }

  getMeta(): TransformationOnPositionRuleMeta {
    return {
      ...this.config,
    };
  }
}
