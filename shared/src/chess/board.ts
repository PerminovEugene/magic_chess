import { isAffectsEql } from "../utils/matchers";
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
} from "./rules/position-specific-movement.rule";
import { isPositionSpecificMovementRuleMeta, RuleMeta } from "./rules/rules";
import { TakeOnThePassMovementRule } from "./rules/take-on-the-pass.rule";
import { fromChessToLogic } from "./turn-formatter";
import { Coordinate } from "./types";

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
    [TakeOnThePassMovementRule.name]: TakeOnThePassMovementRule,
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

  updateCellsOnMove(fromCell: Cell, toCell: Cell, affects?: Affect[]) {
    // really move here
    if (toCell.isEmpty()) {
      const piece = fromCell.popPiece() as Piece;
      toCell.putPiece(piece);
    } else {
      const piece = fromCell.popPiece() as Piece;
      toCell.popPiece();
      toCell.putPiece(piece);
    }
    if (affects) {
      affects.forEach(({ from: [fromX, fromY], to, type }) => {
        if (type === AffectType.kill) {
          this.squares[fromY][fromX].popPiece();
        } else if (type === AffectType.move) {
          // TODO later
        }
      });
    }
  }

  move(
    color: Color,
    from: Coordinate,
    to: Coordinate,
    turns: Turn[],
    clientGenereatedAffects?: Affect[]
  ) {
    // const [fromX, fromY] = fromChessToLogic(from);
    // const [toX, toY] = fromChessToLogic(to);
    const [fromX, fromY] = from;
    const [toX, toY] = to;

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
    const availableMove = this.findValidAvailableMove(
      fromPiece,
      fromX,
      fromY,
      toX,
      toY,
      turns
    );
    if (!availableMove) {
      throw new Error("Invalid move. This piece don't have such movement rule");
    }
    const toCell = this.squares[toY][toX];

    const affects = availableMove[2];
    if (!isAffectsEql(clientGenereatedAffects, affects)) {
      throw new Error("Invalid affects");
    }
    this.updateCellsOnMove(fromCell, toCell, affects);
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

  cast(color: Color, from: Coordinate, to: Coordinate) {}
}
