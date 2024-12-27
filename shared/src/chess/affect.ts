import { Cell } from "./cell";
import { MetaStorage } from "./meta-storage";
import { Piece } from "./piece";
import { buildPieceByMeta } from "./piece-builder";
import { Affect, Affects, AffectType } from "./affect.types";
import { Coordinate } from "./coordinate";

export function handleKillAffect(
  affect: Affect,
  cells: Cell[][]
): Piece | undefined {
  const { from, type } = affect;

  if (type !== AffectType.kill) {
    return;
  }
  if (!from) {
    throw new Error(
      `Invalid move: kill affect should have from coordinate. From: ${from}`
    );
  }
  const [fromX, fromY] = from;
  const killed = cells[fromY][fromX].popPiece();
  if (!killed) {
    throw new Error(`Invalid affect kill cordinate ${fromX}, ${fromY}`);
  }
  return killed;
}

export function handleTransformAffect(
  affect: Affect,
  cells: Cell[][],
  metaStorage: MetaStorage
) {
  if (affect.type === AffectType.transformation) {
    const { from, type, sourcePieceType, destPieceType } = affect;
    if (type !== AffectType.transformation) {
      return;
    }
    if (!from) {
      throw new Error(
        "Invalid move: transformation affect should have from coordinate"
      );
    }
    if (!sourcePieceType) {
      throw new Error(
        "Invalid move: transformation affect should have sourcePieceType"
      );
    }
    if (!destPieceType) {
      throw new Error(
        "Invalid move: transformation affect should have destPieceType"
      );
    }
    const [fromX, fromY] = from;
    const transformed = cells[fromY][fromX].popPiece();
    if (!transformed) {
      throw new Error(
        `Invalid affect transformation cordinate ${fromX}, ${fromY}. Cell is empty`
      );
    }

    const newPieceMeta = metaStorage.getMeta(transformed.color, destPieceType);

    if (!newPieceMeta) {
      throw new Error(
        `Invalid move: no meta for piece ${transformed.color} ${destPieceType} in meta storage`
      );
    }
    const newPiece = buildPieceByMeta(newPieceMeta);
    cells[fromY][fromX].putPiece(newPiece);
  }
}

export function handleMoveAffect(
  affect: Affect,
  cells: Cell[][],
  metaStorage: MetaStorage
) {
  const { from, type, to } = affect;
  if (type === AffectType.move) {
    if (!to) {
      throw new Error("Invalid move: move affect should have to coordinate");
    }
    if (!from) {
      throw new Error("Invalid move: kill affect should have from coordinate");
    }
    const [fromX, fromY] = from;
    const [toX, toY] = to;
    const pieceMovedByAffect = cells[fromY][fromX].popPiece();
    if (!pieceMovedByAffect) {
      throw new Error(
        `Invalid move: no piece at from coordinate X:${fromX} y:${fromY}`
      );
    }
    if (!cells[toY][toX].isEmpty()) {
      throw new Error("Invalid move: affect moved piece to not empty cell");
    }
    cells[toY][toX].putPiece(pieceMovedByAffect);
  }
}
export function handleSpawnAffect(
  affect: Affect,
  cells: Cell[][],
  spawnedPiece: Piece
) {
  const {
    from,
    type,
    // spawnedPiece
  } = affect;
  if (type === AffectType.spawn) {
    if (
      !from
      // || !spawnedPiece
    ) {
      throw new Error(
        "Invalid move: spawn affect should have from coordinate and spawnedPiece"
      );
    }
    const [fromX, fromY] = from;
    cells[fromY][fromX].putPiece(spawnedPiece);
  }
}

function checkAffectFromAttribute(affect: Affect): void {
  if (!affect.from) {
    throw new Error("From attribute is not provided for affect");
  }
}

function checkAffectToAttribute(affect: Affect): void {
  if (!affect.to) {
    throw new Error("To attribute is not provided for affect");
  }
}

function reverseKillAffect(affect: Affect): Affect {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.spawn,
    from: affect.from,
    // spawnedPiece: killed.reverse()[i],
  };
}

function reverseSpawnAffect(affect: Affect): Affect {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.kill,
    from: affect.from,
  };
}

function reverseMoveAffect(affect: Affect) {
  checkAffectFromAttribute(affect);
  checkAffectToAttribute(affect);
  return {
    type: AffectType.move,
    from: affect.to as Coordinate,
    to: affect.from,
  };
}

function reverseTransformationAffect(affect: Affect) {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.transformation,
    from: affect.from,
    sourcePieceType: affect.destPieceType,
    destPieceType: affect.sourcePieceType,
    pieceTypesForTransformation: affect.pieceTypesForTransformation,
    before: true,
  };
}

export function reverseAffects(
  affects: Affects | undefined
  // killed?: Piece[]
): Affects | undefined {
  return affects
    ? affects.map((affect) => {
        if (affect.type === AffectType.kill) {
          return reverseKillAffect(affect);
        } else if (affect.type === AffectType.move) {
          return reverseMoveAffect(affect);
        } else if (affect.type === AffectType.spawn) {
          return reverseSpawnAffect(affect);
        } else if (affect.type === AffectType.transformation) {
          return reverseTransformationAffect(affect);
        } else {
          throw new Error("Invalid affect type");
        }
      })
    : undefined;
}
