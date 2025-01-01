import { Cell } from "../cell";
// import { MetaStorage } from "../meta-storage";
import { Piece } from "../piece/piece";
import { buildPieceByMeta } from "../piece/piece-builder";
import {
  Affect,
  Affects,
  AffectType,
  KillAffect,
  MoveAffect,
  SpawnAffect,
  TransformationAffect,
} from "./affect.types";
import {
  isKillAffect,
  isMoveAffect,
  isNotMainMoveAffect,
  isSpawnAffect,
  isTransformationAffect,
} from "./affect.utils";
import { Coordinate } from "../coordinate";
import { BoardMeta } from "../board/board.types";

export function handleKillAffect(
  affect: Affect,
  cells: Cell[][],
  killed: Piece[]
) {
  const { from, type } = affect;

  if (isKillAffect(affect)) {
    const [fromX, fromY] = from;
    const killedPiece = cells[fromY][fromX].popPiece();
    if (!killedPiece) {
      throw new Error(`Invalid affect kill cordinate ${fromX}, ${fromY}`);
    }
    killed.push(killedPiece);
  }
}

export function handleTransformAffect(
  affect: Affect,
  cells: Cell[][],
  boardMeta: BoardMeta
) {
  if (isTransformationAffect(affect)) {
    const { from, sourcePieceType, destPieceType } = affect;
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

    console.log("transformationsPieceMeta", boardMeta.pieceMeta);

    const newPieceMeta = boardMeta.pieceMeta.find(
      (pieceMeta) =>
        pieceMeta.color === transformed.color &&
        pieceMeta.type === destPieceType
    );

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
  cells: Cell[][]
  // metaStorage: MetaStorage
) {
  if (isMoveAffect(affect) || isNotMainMoveAffect(affect)) {
    checkAffectToAttribute(affect);

    const { from, to } = affect;
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
// currently it's purely for reverting kill
export function handleSpawnAffect(
  affect: Affect,
  cells: Cell[][],
  killed: Piece[]
) {
  if (isSpawnAffect(affect)) {
    const [fromX, fromY] = affect.from;
    const spawnedPiece = killed.pop();
    if (!spawnedPiece) {
      throw new Error("Invalid move: no piece to spawn");
    }
    cells[fromY][fromX].putPiece(spawnedPiece);
  }
}

function checkAffectFromAttribute(affect: Affect): void {
  if (!affect.from) {
    throw new Error("From attribute is not provided for affect");
  }
}

function checkAffectToAttribute(affect: MoveAffect): void {
  if (!affect.to) {
    throw new Error("To attribute is not provided for affect");
  }
}

function reverseKillAffect(affect: KillAffect): SpawnAffect {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.spawn,
    from: affect.from,
    // spawnedPiece: killed.reverse()[i],
  };
}

function reverseSpawnAffect(affect: SpawnAffect): KillAffect {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.kill,
    from: affect.from,
  };
}

function reverseMoveAffect(affect: MoveAffect): MoveAffect {
  checkAffectFromAttribute(affect);
  checkAffectToAttribute(affect);
  return {
    type: AffectType.move,
    from: affect.to as Coordinate,
    to: affect.from,
  };
}

function reverseTransformationAffect(
  affect: TransformationAffect
): TransformationAffect {
  checkAffectFromAttribute(affect);
  return {
    type: AffectType.transformation,
    from: affect.from,
    sourcePieceType: affect.destPieceType,
    destPieceType: affect.sourcePieceType,
    // pieceTypesForTransformation: affect.pieceTypesForTransformation,
    // before: true,
  };
}

export function reverseAffects(affects: Affects): Affects {
  return affects.toReversed().map((affect: Affect) => {
    if (isKillAffect(affect)) {
      return reverseKillAffect(affect);
    } else if (isMoveAffect(affect)) {
      return reverseMoveAffect(affect);
    } else if (isNotMainMoveAffect(affect)) {
      return reverseMoveAffect(affect);
    } else if (isSpawnAffect(affect)) {
      return reverseSpawnAffect(affect);
    } else if (isTransformationAffect(affect)) {
      return reverseTransformationAffect(affect);
    } else {
      throw new Error("Invalid affect type");
    }
  });
}
