import { Cell } from "./cell";
import { Color, Piece } from "./piece";

export class Board {
  public size = 8;
  public squares: Cell[][];
  constructor() {
    this.squares = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => new Cell())
    );
  }

  private xCharToIndex = (char: string) => char.charCodeAt(0) - 97;
  private yCharToIndex = (char: string) => parseInt(char);
  private isIndexInValid = (index: number) => index >= 0 || index < this.size;

  move(color: Color, from: string, to: string) {
    const [fromXChar, fromYChar] = from.split("");
    const [toXChar, toYChar] = to.split("");

    const fromX = this.xCharToIndex(fromXChar);
    const toX = this.xCharToIndex(toXChar);
    const fromY = this.yCharToIndex(fromYChar);
    const toY = this.yCharToIndex(toYChar);

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

    if (fromCell.isEmpty()) {
      throw new Error("Invalid move. Selected cell is empty");
    }
    const fromPiece = fromCell.getPiece();

    if (!fromCell.isEmpty() || fromPiece?.color !== color) {
      throw new Error("Invalid move. Selected piece is not your color");
    }
    if (!this.isMoveValid(fromPiece, fromX, fromY, toX, toY)) {
      throw new Error("Invalid move. This piece don't have such movement rule");
    }
    const toCell = this.squares[toX][toY];
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
}
