import { Cell } from "./cell";
import { BoardMeta, Turn } from "./game";
import {
  Bishop,
  Color,
  King,
  Knight,
  Pawn,
  Piece,
  PieceMeta,
  PieceType,
  Queen,
  Rook,
} from "./piece";
import {
  Affect,
  AffectType,
  AvailableMove,
  DiagonalMovementRule,
  HorizontalMovementRule,
  KnightMovementRule,
  VerticalMovementRule,
} from "./rules";
import {
  ActivatePositions,
  PositionSpecificMovementRule,
} from "./rules/piece-movement/position-specific-movement.rule";
import {
  isPositionSpecificMovementRuleMeta,
  RuleMeta,
} from "./rules/piece-movement/rules";
import { TakeOnThePassMovementRule } from "./rules/piece-movement/take-on-the-pass.rule";
import { Coordinate } from "./coordinate";
import { CastlingMovementRule } from "./rules/piece-movement/castling.rule";

export class Board {
  public size = 8;
  public squares: Cell[][];
  private v = "1";

  constructor() {
    this.squares = this.buildCells();
  }

  public buildCells() {
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => new Cell())
    );
  }

  public isIndexInValid = (index: number) => index >= 0 || index < this.size;

  public getMeta(): BoardMeta {
    const boardMeta: any[][] = Array.from({ length: this.squares.length }, () =>
      Array.from({ length: this.size }, () => null)
    );
    for (let i = 0; i < this.squares.length; i++) {
      for (let j = 0; j < this.squares[i].length; j++) {
        const cell = this.squares[i][j];
        const piece = cell.getPiece();
        if (piece) {
          const meta = piece.getMeta();
          boardMeta[i][j] = meta;
        }
      }
    }
    return boardMeta;
  }

  private mapper = {
    [PieceType.Pawn]: Pawn,
    [PieceType.Bishop]: Bishop,
    [PieceType.Knight]: Knight,
    [PieceType.Rook]: Rook,
    [PieceType.Queen]: Queen,
    [PieceType.King]: King,
  };
  private rulesMapper = {
    [VerticalMovementRule.name]: VerticalMovementRule,
    [HorizontalMovementRule.name]: HorizontalMovementRule,
    [DiagonalMovementRule.name]: DiagonalMovementRule,
    [KnightMovementRule.name]: KnightMovementRule,
    [PositionSpecificMovementRule.name]: PositionSpecificMovementRule,
    [TakeOnThePassMovementRule.name]: TakeOnThePassMovementRule,
    [CastlingMovementRule.name]: CastlingMovementRule,
  };

  buildPieceByMeta(meta: PieceMeta) {
    const c = this.mapper[meta.type as PieceType];
    return new c(
      meta.color,
      meta.rules.map((ruleMeta: RuleMeta) => {
        const r = this.rulesMapper[ruleMeta.name];

        let uniqRulesParams: any = {};
        if (isPositionSpecificMovementRuleMeta(ruleMeta)) {
          const activatePositions: ActivatePositions = {};
          if (ruleMeta.activatePositions.x) {
            activatePositions.x = new Set(ruleMeta.activatePositions.x);
          }
          if (ruleMeta.activatePositions.y) {
            activatePositions.y = new Set(ruleMeta.activatePositions.y);
          }
          uniqRulesParams.activatePositions = activatePositions;
        }
        return new r({
          ...ruleMeta,
          directions: new Set(ruleMeta.directions),
          ...uniqRulesParams,
        });
      })
    );
  }
  fillBoardByMeta(metas: BoardMeta) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const meta = metas[row][col];

        const cell = this.getCell(col, row);
        if (meta) {
          cell.putPiece(this.buildPieceByMeta(meta));
        }
      }
    }
  }

  getCell(x: number, y: number) {
    return this.squares[y][x];
  }

  updateCellsOnMove(
    cells: Cell[][],
    fromCell: Cell,
    toCell: Cell,
    affects?: Affect[]
  ): Piece[] {
    const killedPieces: Piece[] = [];
    if (affects) {
      affects.forEach(({ from, to, type, spawnedPiece }) => {
        if (type === AffectType.kill) {
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
          killedPieces.push(killed);
        }
      });
    }
    if (toCell.isEmpty()) {
      const piece = fromCell.popPiece() as Piece;
      toCell.putPiece(piece);
    } else {
      const piece = fromCell.popPiece() as Piece;
      toCell.popPiece();
      toCell.putPiece(piece);
    }
    if (affects) {
      affects.forEach(({ from, to, type, spawnedPiece }) => {
        if (type === AffectType.move) {
          if (!to) {
            throw new Error(
              "Invalid move: move affect should have to coordinate"
            );
          }
          if (!from) {
            throw new Error(
              "Invalid move: kill affect should have from coordinate"
            );
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
            throw new Error(
              "Invalid move: affect moved piece to not empty cell"
            );
          }
          cells[toY][toX].putPiece(pieceMovedByAffect);
        } else if (type === AffectType.spawn) {
          if (!to || !spawnedPiece) {
            throw new Error(
              "Invalid move: spawn affect should have to coordinate and spawnedPiece"
            );
          }
          const [toX, toY] = to;
          cells[toY][toX].putPiece(spawnedPiece);
        }
      });
    }
    return killedPieces;
  }

  // validateTurn(newTurn: Turn, turns: Turn[]) {
  //   const { color, from, to, affects } = newTurn;

  //   const [fromX, fromY] = from;
  //   const [toX, toY] = to;

  //   if (
  //     !(
  //       this.isIndexInValid(fromX) &&
  //       this.isIndexInValid(fromY) &&
  //       this.isIndexInValid(toX) &&
  //       this.isIndexInValid(toY)
  //     )
  //   ) {
  //     throw new Error("Invalid move");
  //   }
  //   const fromCell: Cell = this.getCell(fromX, fromY);
  //   if (fromCell.isEmpty()) {
  //     throw new Error("Invalid move. Selected cell is empty");
  //   }

  //   const fromPiece = fromCell.getPiece();
  //   if (fromPiece?.color !== color) {
  //     throw new Error("Invalid move. Selected piece is not your color");
  //   }

  //   const availableMove = this.findValidAvailableMove(
  //     fromPiece,
  //     fromX,
  //     fromY,
  //     toX,
  //     toY,
  //     turns
  //   );
  //   if (!availableMove) {
  //     throw new Error("Invalid move. This piece don't have such movement rule");
  //   }

  //   const serverSideCalculatedAffects = availableMove[2];
  //   if (!isAffectsEql(serverSideCalculatedAffects, affects)) {
  //     throw new Error("Invalid affects");
  //   }
  // }

  // move(newTurn: Turn) {
  //   const { from, to, affects } = newTurn;
  //   const [fromX, fromY] = from;
  //   const [toX, toY] = to;

  //   const fromCell: Cell = this.getCell(fromX, fromY);
  //   const toCell = this.getCell(toX, toY);

  //   this.updateCellsOnMove(this.squares, fromCell, toCell, affects);
  // }

  public duplicatePosition(cells: Cell[][]): Cell[][] {
    this.squares.forEach((row, y) => {
      row.forEach((cell, x) => {
        const piece = cell.getPiece();
        if (piece) {
          cells[y][x].putPiece(piece);
        } else {
          cells[y][x].popPiece();
        }
      });
    });
    return cells;
  }

  public findValidAvailableMove(
    piece: Piece,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    turns: Turn[]
  ): AvailableMove | undefined {
    for (const rule of piece.movementRules) {
      const allAvailableMovesForRule = rule.availableMoves(
        fromX,
        fromY,
        this.squares,
        turns
      );
      const sameMove = allAvailableMovesForRule.find(
        ([x, y]) => x === toX && y === toY
      );
      if (sameMove) {
        return sameMove;
      }
    }
  }

  public findUniqPiece(cells: Cell[][], color: Color, pieceType: PieceType) {
    let king: Coordinate | undefined;
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        const cell = cells[i][j];
        const piece = cell.getPiece();
        if (piece && piece.color === color && piece.type === pieceType) {
          king = [j, i];
          break;
        }
      }
    }
    if (!king) {
      throw new Error("King not found");
    }
    return king;
  }

  cast(color: Color, from: Coordinate, to: Coordinate) {}
}
