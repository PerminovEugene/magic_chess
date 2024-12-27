import { PieceType } from "../../piece.consts";
import { Color } from "../../color";
import { AvailableMove } from "../piece-movement/movement-rule";
import { PostMovementRule, PostMovementRuleMeta } from "./post-movement.rule";
import { Affect, AffectType } from "../../affect.types";
import { PostMovementRules } from "../piece-movement/movement-rules.const";

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
    availableMoves: AvailableMove[],
    sourcePieceType: PieceType
  ): AvailableMove[] {
    const newMoves: AvailableMove[] = [];
    if (this.charges > 0) {
      for (let move of availableMoves) {
        const [x, y] = move;
        if (y === this.config.triggerOnY) {
          for (const destPieceType of this.config.possiblePiecesTypes) {
            const moveVariation = this.cloneMoveAndAddSelectedTypeVariation(
              move,
              destPieceType,
              sourcePieceType
            );
            newMoves.push(moveVariation);
          }
        }
      }
    }
    if (!newMoves.length) {
      return availableMoves;
    }
    return newMoves;
  }

  cloneMoveAndAddSelectedTypeVariation(
    move: AvailableMove,
    type: PieceType,
    sourcePieceType: PieceType
  ): AvailableMove {
    const [x, y] = move;
    const newMove: AvailableMove = [
      x,
      y,
      [
        ...(move[2] || []),
        {
          type: AffectType.transformation,
          from: [x, y],
          pieceTypesForTransformation: this.config.possiblePiecesTypes,
          destPieceType: type,
          sourcePieceType,
        } as Affect,
      ],
    ];
    return newMove;
  }

  getMeta(): TransformationOnPositionRuleMeta {
    return {
      ...this.config,
    };
  }
}
