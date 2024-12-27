import { Affects } from "./affect.types";
import { Color } from "./color";
import { Coordinate } from "./coordinate";
import { PieceType } from "./piece.consts";

export enum TurnType {
  Move = "move",
  Skill = "skill",
}

export type Turn = {
  color: Color;
  type: TurnType;
  pieceType: PieceType;
  from: Coordinate;
  to: Coordinate;
  affects?: Affects;
  timestamp: string;
  check?: boolean;
  selectedPieceType?: PieceType; // using for transforming pawn to another piece
};
