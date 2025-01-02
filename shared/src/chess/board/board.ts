import { Cell } from "../cell";
import { Turn } from "../turn";
import { Color } from "../color";
import { Piece } from "../piece/piece";
import { PieceType } from "../piece/piece.constants";
import { Action } from "../affect/affect.types";
import { Coordinate } from "../coordinate";
import {
  handleKillAffect,
  handleMoveAffect,
  handleSpawnAffect,
  handleTransformAffect,
  reverseAffects,
} from "../affect/affect";
import { buildPieceByMeta } from "../piece/piece-builder";
import { BoardMeta } from "./board.types";
import { RulesEngine } from "../rules-engine";

/**
 * Board keeps data about current game position and pieces on the array of cells
 * It provides methods for manipulation by affects, but not dirrect access to pieces
 * Always should be filled in by metadata
 */
export class Board {
  public size = 8;
  private squares: Cell[][];
  private rulesEngine = new RulesEngine();

  /**
   * Metastorage is needed for saving initial data about pieces
   * It can be used for transformation of pieces
   */
  private meta: BoardMeta | undefined;

  constructor() {
    this.squares = this.buildCells();
  }

  private buildCells() {
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => new Cell())
    );
  }

  public isIndexValid = (index: number) => index >= 0 && index < this.size;

  public getMeta(): BoardMeta {
    if (!this.meta) {
      throw new Error("Board meta is not defined yet");
    }
    return this.meta;
  }

  public fillBoardByMeta(meta: BoardMeta): void {
    this.meta = meta;
    const { cellsMeta: cells, postMovementRules, movementRules } = meta;
    this.rulesEngine.addMovementRules(movementRules);
    this.rulesEngine.addPostMovementRules(postMovementRules);

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const pieceMetaId = cells[row][col];

        if (pieceMetaId) {
          const cell = this.getCell(col, row);

          const pieceMeta = meta.pieceMeta.find(({ id }) => id === pieceMetaId);
          if (!pieceMeta) {
            throw new Error("Piece meta not found");
          }
          cell.putPiece(buildPieceByMeta(pieceMeta));
        }
      }
    }
  }

  public getPiece = (x: number, y: number) => {
    return this.squares[y][x].getPiece();
  };
  public getPieceByCoordinate = (xy: Coordinate) => {
    return this.squares[xy[1]][xy[0]].getPiece();
  };

  private getCell(x: number, y: number) {
    return this.squares[y][x];
  }

  public forEachPiece(
    color: Color,
    callback: (piece: Piece, x: number, y: number) => void
  ) {
    this.squares.forEach((row, y) => {
      row.forEach((cell, x) => {
        const piece = cell.getPiece();
        if (piece && piece.color === color) {
          callback(piece, x, y);
        }
      });
    });
  }

  // now [x, y, affects]
  // to action: affects[]. Affects with user choice marked with field and will be used for tree building
  //
  public getPieceAvailableMoves(x: number, y: number, turns: Turn[]): Action[] {
    const availableMoves: Action[] = [];

    const piece = this.getPiece(x, y);
    if (!piece) {
      throw new Error("Can not get moves for invalid piece coordinates");
    }
    const { movementRules, postMovementRules } = piece;

    movementRules.forEach((ruleId) => {
      const ruleMoves = this.rulesEngine.getAvailableMoves(
        ruleId,
        x,
        y,
        this.getPiece,
        turns,
        this.size
      );
      availableMoves.push(...ruleMoves);
    });
    let updatedMoves: Action[] = availableMoves;
    postMovementRules?.forEach((ruleId) => {
      updatedMoves = this.rulesEngine.addPostMovementCorrections(
        ruleId,
        updatedMoves,
        piece.type
      );
    });

    return updatedMoves;
  }

  /**
   * We keep all killed and removed from the board pieces here.
   * Transformations are not included.
   */
  private killed: Piece[] = [];

  public updateCellsOnMove(affects: Action) {
    if (!this.meta) {
      throw new Error("Board meta is not defined yet");
    }
    affects.forEach((affect) => {
      handleKillAffect(affect, this.squares, this.killed);
      handleMoveAffect(affect, this.squares);
      handleTransformAffect(affect, this.squares, this.meta as BoardMeta);
      handleSpawnAffect(affect, this.squares, this.killed);
    });
  }

  public revertMove(affects: Action): void {
    const reversedAffects = reverseAffects(affects);
    this.updateCellsOnMove(reversedAffects);
  }

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

  public findUniqPiece(color: Color, pieceType: PieceType): Coordinate {
    let king: Coordinate | undefined;
    for (let i = 0; i < this.squares.length; i++) {
      for (let j = 0; j < this.squares[i].length; j++) {
        const cell = this.squares[i][j];
        const piece = cell.getPiece();
        if (piece && piece.color === color && piece.type === pieceType) {
          return [j, i];
        }
      }
    }

    throw new Error(`${pieceType} not found`);
  }

  cast(color: Color, from: Coordinate, to: Coordinate) {}
}
