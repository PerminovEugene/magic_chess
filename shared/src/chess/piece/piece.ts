import { Color } from "../color";
import { PieceType } from "./piece.constants";
import { MovementRule, PostMovementRule } from "../rules";

export abstract class Piece {
  constructor(
    public type: PieceType,
    public color: Color,
    public movementRules: MovementRule["id"][],
    public postMovementRules?: PostMovementRule["id"][]
  ) {}

  getMeta() {
    return {
      type: this.type,
      color: this.color,
      rules: this.movementRules,
      postMovementRulesMeta: this.postMovementRules,
    };
  }

  // public getPieceAvailableMoves(
  //   x: number,
  //   y: number,
  //   getPiece: GetPiece,
  //   turns: Turn[],
  //   size: number
  // ): AvailableMove[] {
  //   const availableMoves: AvailableMove[] = [];

  //   this.movementRules.forEach((rule) => {
  //     const ruleMoves = rule.availableMoves(x, y, getPiece, turns, size);
  //     availableMoves.push(...ruleMoves);
  //   });
  //   let updatedMoves: AvailableMove[] = availableMoves;
  //   this.postMovementRules?.forEach((rule) => {
  //     // OMG iT"S UGLY
  //     updatedMoves = rule.updateMovesAffects(updatedMoves, this);
  //   });

  //   return updatedMoves;
  // }
}
