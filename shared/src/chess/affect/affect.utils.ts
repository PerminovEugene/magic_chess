import {
  KillAffect,
  AffectType,
  MoveAffect,
  MoveNotMainAffect,
  SpawnAffect,
  TransformationAffect,
  ReversedTranformationAffect,
  Affect,
} from "./affect.types";
import { Coordinate } from "../coordinate";
import { PieceType } from "../piece/piece.constants";

export function isKillAffect(affect: any): affect is KillAffect {
  return affect.type === AffectType.kill;
}

export function isMoveAffect(affect: any): affect is MoveAffect {
  return affect.type === AffectType.move;
}

export function isNotMainMoveAffect(affect: any): affect is MoveNotMainAffect {
  return affect.type === AffectType.moveNotMain;
}

export function isSpawnAffect(affect: any): affect is SpawnAffect {
  return affect.type === AffectType.spawn;
}

export function isTransformationAffect(
  affect: any
): affect is TransformationAffect {
  return affect.type === AffectType.transformation;
}

export function isReversedTransformationAffect(
  affect: any
): affect is ReversedTranformationAffect {
  return affect.type === AffectType.reversedTransformation;
}

export function isUserSelectableAffect(affect: Affect): boolean {
  return !!affect.userSelected;
}

export function markAsUserSelected(a: Affect) {
  a.userSelected = true;
  return a;
}

export function buildMoveAffect(from: Coordinate, to: Coordinate): MoveAffect {
  return {
    type: AffectType.move,
    from,
    to,
  };
}

export function buildKillAffect(from: Coordinate): KillAffect {
  return {
    type: AffectType.kill,
    from,
  };
}

export function buildSpawnAffect(from: Coordinate): SpawnAffect {
  return {
    type: AffectType.spawn,
    from,
  };
}

export function buildTransformationAffect(
  from: Coordinate,
  destPieceType: PieceType,
  sourcePieceType: PieceType
): TransformationAffect {
  return {
    type: AffectType.transformation,
    from,
    destPieceType,
    sourcePieceType,
  };
}

export function buildReversedTransformationAffect(
  from: Coordinate,
  destPieceType: PieceType,
  sourcePieceType: PieceType
): ReversedTranformationAffect {
  return {
    type: AffectType.reversedTransformation,
    from,
    destPieceType,
    sourcePieceType,
  };
}

// currently supports only move
export function getUserSelectedMoveAffect(affects: Affect[]): MoveAffect {
  const a = affects.find(
    (a) => a.userSelected && isMoveAffect(a)
  ) as MoveAffect;
  if (!a) {
    throw new Error("User selected from coordinate is not found");
  }
  return a;
}
