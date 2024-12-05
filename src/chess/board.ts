import { Cell } from "./cell";
import { Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook } from "./piece";
import { Direction } from "./rules";
import { VerticalMovementRule } from "./rules/vertical-movement.rule";

export class Board {
  public size: 8;
  public squares: Cell[][];
  constructor() {
    this.squares = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => new Cell())
    );
    this.spawnColor(Color.white);
    this.spawnColor(Color.black);
  }

  private xCharToIndex = (char: string) => char.charCodeAt(0) - 97;
  private yCharToIndex = (char: string) => parseInt(char);
  private isIndexInValid = (index) => index >= 0 || index < this.size;

  move(color: Color, from: string, to: string) {
    const [fromXChar, fromYChar] = from.split("");
    const [toXChar, toYChar] = to.split("");

    const fromX = this.xCharToIndex(fromXChar);
    const toX = this.xCharToIndex(toXChar);
    const fromY = this.yCharToIndex(fromYChar);
    const toY = this.yCharToIndex(fromYChar);

    if (
      !(
        this.isIndexInValid(fromX) &&
        this.isIndexInValid(toX) &&
        this.isIndexInValid(toX) &&
        this.isIndexInValid(toY)
      )
    ) {
      throw new Error("Invalid move");
    }
    const fromCell: Cell = this.squares[fromX][fromY];

    const fromPiece = fromCell.getPiece();
    if (fromCell.isEmpty()) {
      throw new Error("Invalid move. Selected cell is empty");
    }
    if (!fromCell.isEmpty() || fromPiece.color !== color) {
      throw new Error("Invalid move. Selected piece is not your color");
    }
    if (!this.isMoveValid(fromPiece, fromX, fromY, toX, toY)) {
      throw new Error("Invalid move. This piece don't have such movement rule");
    }
    const toCell = this.squares[toX][toY];
    // really move here
    if (toCell.isEmpty()) {
      const piece = fromCell.popPiece();
      toCell.putPiece(piece);
    } else {
      const piece = fromCell.popPiece();
      toCell.popPiece();
      toCell.putPiece(piece);
    }
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
      if (availableMoves.find(([x, y]) => x === toX && y === toY)) {
        return true;
      }
    }
    return false;
  }

  cast(color: Color, from: string, to: string) {}

  spawnColor(color: Color) {
    const spawnLine = color === Color.black ? 0 : 6;

    for (let i = 0; i < this.size; i++) {
      this.squares[spawnLine + 1][i].putPiece(
        new Pawn(color, [
          new VerticalMovementRule({
            moveToEmpty: true,
            moveToKill: false,
            collision: true,
            distance: 1,
            directions:
              color == Color.black
                ? new Set<Direction>([Direction.Down])
                : new Set<Direction>([Direction.Up]),
          }),
        ])
      );
    }
    this.squares[spawnLine][1].putPiece(new Rook(color));
    this.squares[spawnLine][2].putPiece(new Bishop(color));
    this.squares[spawnLine][3].putPiece(new Knight(color));
    this.squares[spawnLine][4].putPiece(new King(color));
    this.squares[spawnLine][4].putPiece(new Queen(color));
    this.squares[spawnLine][5].putPiece(new Knight(color));
    this.squares[spawnLine][6].putPiece(new Bishop(color));
    this.squares[spawnLine][7].putPiece(new Rook(color));
  }
}
