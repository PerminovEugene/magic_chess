import { Coordinate } from "../coordinate";
import { PieceType } from "../piece/piece.constants";

export enum AffectType {
  move = "move",
  kill = "kill",
  spawn = "spawn",
  transformation = "transformation",
  reversedTransformation = "reversedTransformation",
}

export type Affect =
  | MoveAffect
  | KillAffect
  | SpawnAffect
  | TransformationAffect;

export type Affects = Affect[];

export type UserSelectedAffectMixin = {
  userSelected?: boolean;
};

export type MoveAffect = {
  type: AffectType.move;
  from: Coordinate;
  to: Coordinate;
} & UserSelectedAffectMixin;

export type KillAffect = {
  type: AffectType.kill;
  from: Coordinate;
} & UserSelectedAffectMixin;

export type SpawnAffect = {
  type: AffectType.spawn;
  from: Coordinate;
} & UserSelectedAffectMixin;

export type TransformationAffect = {
  type: AffectType.transformation;
  from: Coordinate;
  destPieceType: PieceType;
  sourcePieceType: PieceType;
} & UserSelectedAffectMixin;
