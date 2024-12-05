import { Piece } from "./piece";

export class Cell {
  constructor(public piece?: Piece) {}

  public putPiece(piece: Piece) {
    this.piece = piece;
  }
  public popPiece() {
    let piece = this.piece;
    this.piece = undefined;
    return piece;
  }
  public isEmpty() {
    return !this.piece;
  }
  public getPiece() {
    return this.piece;
  }
}
