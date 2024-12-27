import { Coordinate } from "./coordinate";
import { X, Y, Hash } from "./moves-tree.types";
import { PieceType } from "./piece.consts";

const postfixToPieceType = {
  Q: PieceType.Queen,
  R: PieceType.Rook,
  B: PieceType.Bishop,
  K: PieceType.Knight,
};

export function toKey(x: X, y: Y, transformPieceType?: PieceType) {
  const postFix = transformPieceType ? `-${transformPieceType[0]}` : "";
  return `${x},${y}${postFix}`;
}
export function coordToKey(c: Coordinate, transformPieceType?: PieceType) {
  return toKey(c[0], c[1], transformPieceType);
}
export type TurnChoosableData = [X, Y, PieceType?];
export function parseToKey(key: Hash): TurnChoosableData {
  if (key.length > 3) {
    const [xy, pieceCode] = key.split("-");
    const [x, y] = xy.split(",");
    return [
      Number(x),
      Number(y),
      postfixToPieceType[pieceCode as keyof typeof postfixToPieceType],
    ] as TurnChoosableData;
  }
  return key.split(",").map(Number) as TurnChoosableData;
}
export function parseKey(key: Hash): Coordinate {
  return key.split(",").map(Number) as Coordinate;
}
