import { Cell } from "./cell";
import { BoardMeta } from "./game";
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
  DiagonalMovementRule,
  HorizontalMovementRule,
  KnightMovementRule,
  VerticalMovementRule,
} from "./rules";
import {
  ActivatePositions,
  PositionSpecificMovementRule,
} from "./rules/position-specific-movement.rule";
import { isPositionSpecificMovementRuleMeta, RuleMeta } from "./rules/rules";
import { fromChessToLogic } from "./turn-formatter";

export class Board {
  public size = 8;
  public squares: Cell[][];
  constructor() {
    this.squares = Array.from({ length: this.size }, () =>
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
  };

  buildPiece(meta: PieceMeta) {
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

  fillBoard(metas: BoardMeta) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const meta = metas[row][col];

        const cell = this.getCell(col, row);
        if (meta) {
          cell.putPiece(this.buildPiece(meta));
        }
      }
    }
  }
  getCell(x: number, y: number) {
    return this.squares[y][x];
  }

  updateCellsOnMove(fromCell: Cell, toCell: Cell) {
    // really move here
    if (toCell.isEmpty()) {
      const piece = fromCell.popPiece() as Piece;
      toCell.putPiece(piece);
    } else {
      const piece = fromCell.popPiece() as Piece;
      toCell.popPiece();
      toCell.putPiece(piece);
    }
  }

  move(color: Color, from: string, to: string) {
    const [fromX, fromY] = fromChessToLogic(from);
    const [toX, toY] = fromChessToLogic(to);

    if (
      !(
        this.isIndexInValid(fromX) &&
        this.isIndexInValid(fromY) &&
        this.isIndexInValid(toX) &&
        this.isIndexInValid(toY)
      )
    ) {
      throw new Error("Invalid move");
    }
    const fromCell: Cell = this.squares[fromY][fromX];

    if (fromCell.isEmpty()) {
      throw new Error("Invalid move. Selected cell is empty");
    }
    const fromPiece = fromCell.getPiece();

    if (fromPiece?.color !== color) {
      throw new Error("Invalid move. Selected piece is not your color");
    }
    if (!this.isMoveValid(fromPiece, fromX, fromY, toX, toY)) {
      throw new Error("Invalid move. This piece don't have such movement rule");
    }
    const toCell = this.squares[toY][toX];
    // really move here
    this.updateCellsOnMove(fromCell, toCell);
  }

  public isMoveValid(
    piece: Piece,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    for (const rule of piece.movementRules) {
      const availableMoves = rule.availableMoves(fromX, fromY, this.squares);
      const movesFromRule = availableMoves.map(([x, y]) => [x, y]);
      if (availableMoves.find(([x, y]) => x === toX && y === toY)) {
        return true;
      }
    }
    return false;
  }

  cast(color: Color, from: string, to: string) {}
}
