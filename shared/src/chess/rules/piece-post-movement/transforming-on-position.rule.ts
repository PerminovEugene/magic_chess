import { PieceType } from "../../piece/piece.constants";
import { Color } from "../../color";
import { Action } from "../piece-movement/movement-rule";
import { PostMovementRule } from "./post-movement.rule";
import { PostMovementRuleMeta } from "./post.movement.types";
import { AffectType } from "../../affect/affect.types";
import { PostMovementRules } from "../piece-movement/movement-rules.const";
import {
  buildTransformationAffect,
  markAsUserSelected,
} from "../../affect/affect.utils";
import { Entity } from "../../entity";

export type TransformationOnPositionRuleConfig = {
  name: PostMovementRules;
  triggerOnX?: number;
  triggerOnY?: number;
  color: Color;
  // metadata for these pieces should be in board metadata
  possiblePiecesTypes: PieceType[];
  maxCharges: number;
} & Entity;
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
    super(config.id, config.name);
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
            const transformationAffect = markAsUserSelected(
              buildTransformationAffect(
                moveAffect.to,
                destPieceType,
                sourcePieceType
              )
            );

            newMoves.push([...action, transformationAffect]);
          }
        } else {
          newMoves.push(action);
        }
      }
    }
    return newMoves;
  }

  getMeta(): TransformationOnPositionRuleMeta {
    return {
      ...this.config,
    };
  }
}
