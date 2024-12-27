import { Coordinate } from "./coordinate";
import { PieceType } from "./piece.consts";

export enum AffectType {
  move = "move",
  kill = "kill",
  spawn = "spawn",
  transformation = "transformation",
}
export type Affect = {
  from: Coordinate;
  to?: Coordinate;
  type: AffectType;

  destPieceType?: PieceType;
  sourcePieceType?: PieceType;
  pieceTypesForTransformation?: PieceType[];
  before?: boolean;
};
export type Affects = Affect[];
