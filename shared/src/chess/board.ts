import { Cell } from "./cell";
import { Turn } from "./turn";
import { Color } from "./color";
import { Piece } from "./piece";
import { PieceMeta } from "./piece.types";
import { PieceType } from "./piece.consts";
import { AvailableMove } from "./rules/piece-movement/movement-rule";
import { Coordinate } from "./coordinate";
import { MetaStorage } from "./meta-storage";
import {
  handleKillAffect,
  handleMoveAffect,
  handleSpawnAffect,
  handleTransformAffect,
} from "./affect";
import { buildPieceByMeta } from "./piece-builder";
import { BoardMeta } from "./board.types";
import { RulesEngine } from "./rules-engine";

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
  private metaStorage: MetaStorage = new MetaStorage();

  constructor() {
    this.squares = this.buildCells();
  }

  private buildCells() {
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

  public fillBoardByMeta(metas: BoardMeta): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const meta = metas[row][col];

        if (meta) {
          const cell = this.getCell(col, row);
          this.metaStorage.setMeta(meta);
          cell.putPiece(buildPieceByMeta(meta));
          this.rulesEngine.addMovementRules(meta.rules);
          if (meta.postMovementRulesMeta) {
            this.rulesEngine.addPostMovementRules(meta.postMovementRulesMeta);
          }
        }
      }
    }
  }
  public saveAdditionalMeta(pieceMeta: PieceMeta[]) {
    pieceMeta.forEach((meta) => {
      this.metaStorage.setMeta(meta);
    });
  }

  public getPiece = (x: number, y: number) => {
    return this.squares[y][x].getPiece();
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
  public getPieceAvailableMoves(
    x: number,
    y: number,
    turns: Turn[]
  ): AvailableMove[] {
    const availableMoves: AvailableMove[] = [];

    const piece = this.getPiece(x, y);
    if (!piece) {
      throw new Error("Can not get moves for invlaid piece coordinates");
    }
    const { movementRules, postMovementRules } = piece;

    movementRules.forEach((rule) => {
      const ruleMoves = this.rulesEngine.getAvailableMoves(
        rule,
        x,
        y,
        this.getPiece,
        turns,
        this.size
      );
      availableMoves.push(...ruleMoves);
    });
    let updatedMoves: AvailableMove[] = availableMoves;
    postMovementRules?.forEach((rule) => {
      updatedMoves = this.rulesEngine.addPostMovementCorrections(
        rule,
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

  public updateCellsOnMove(from: Coordinate, AvailableMove: AvailableMove) {
    const [toX, toY, affects] = AvailableMove;
    const [fromX, fromY] = from;

    if (affects) {
      affects.forEach((affect) => {
        const unspawned = handleKillAffect(affect, this.squares);
        if (unspawned) {
          this.killed.push(unspawned);
        }
        if (affect.before) {
          handleTransformAffect(affect, this.squares, this.metaStorage);
        }
      });
    }
    const fromCell = this.getCell(fromX, fromY);
    const toCell = this.getCell(toX, toY);

    if (toCell.isEmpty()) {
      const piece = fromCell.popPiece() as Piece;
      toCell.putPiece(piece);
    } else {
      const piece = fromCell.popPiece() as Piece;
      const killed = toCell.popPiece();
      this.killed.push(killed as Piece);
      toCell.putPiece(piece);
    }
    if (affects) {
      affects.forEach((affect) => {
        if (!affect.before) {
          handleTransformAffect(affect, this.squares, this.metaStorage);
        }
        handleMoveAffect(affect, this.squares, this.metaStorage);
        handleSpawnAffect(affect, this.squares, this.killed.pop() as Piece);
      });
    }
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
