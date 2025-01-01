import {
  Affect,
  Affects,
  AffectType,
  MoveAffect,
  TransformationAffect,
} from "../affect/affect.types";
import { Coordinate } from "../coordinate";
import { X, Y } from "./moves-tree.types";
import { PieceType } from "../piece/piece.constants";

const postfixToPieceType = {
  Q: PieceType.Queen,
  R: PieceType.Rook,
  B: PieceType.Bishop,
  K: PieceType.Knight,
};

const coordinateSeparator = "_";
export function serializeXY(x: X, y: Y) {
  return `${x}${coordinateSeparator}${y}`;
}
export function serializeCoordinate(c: Coordinate) {
  return serializeXY(c[0], c[1]);
}

const affectsSeparator = "#";
const serializationOrder = [AffectType.move, AffectType.transformation];

export function serializeAffects(affects: Affects) {
  const affectsWithChoice = affects.filter((a) => a.userSelected);
  return affectsWithChoice
    .sort((a, b) => {
      return (
        serializationOrder.indexOf(a.type) - serializationOrder.indexOf(b.type)
      );
    })
    .map((a) => serializeAffect(a))
    .join(affectsSeparator);
}

export function serializeAffect(a: Affect) {
  switch (a.type) {
    case AffectType.move:
      return serializeMovementAffect(a as MoveAffect);
    case AffectType.transformation:
      return serializeTransformationAffect(a as TransformationAffect);
    default:
      throw new Error("not found affect serialize");
  }
}

export function serializeMovementAffect(a: MoveAffect) {
  return serializeToCoordinate(a.to);
}
export function serializeToCoordinate(to: Coordinate) {
  return `${to[0]}${coordinateSeparator}${to[1]}`;
}

export function serializeTransformationAffect(a: TransformationAffect) {
  return `${a.destPieceType[0]}`;
}

// export function deserializeAffects(serialized: string): Affects {
//   return serialized.split(affectsSeparator).map((a) => deserializeAffect(a));
// }

// export function parseToKey(key: Hash): TurnChoosableData {
//   if (key.length > 3) {
//     const [xy, pieceCode] = key.split("-");
//     const [x, y] = xy.split(",");
//     return [
//       Number(x),
//       Number(y),
//       postfixToPieceType[pieceCode as keyof typeof postfixToPieceType],
//     ] as TurnChoosableData;
//   }
//   return key.split(",").map(Number) as TurnChoosableData;
// }
// export function parseKey(key: Hash): Coordinate {
//   return key.split(",").map(Number) as Coordinate;
// }
