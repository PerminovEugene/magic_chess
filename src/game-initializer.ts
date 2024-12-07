import { Board } from "../shared/src/chess/board";
import {
  Bishop,
  Color,
  King,
  Knight,
  Pawn,
  Queen,
  Rook,
} from "../shared/src/chess/piece";
import { DiagonalMovementRule } from "../shared/src/chess/rules/diagonal-movement.rule";
import { HorizontalMovementRule } from "../shared/src/chess/rules/horizontal-movement.rule";
import { Direction } from "../shared/src/chess/rules/rules";
import { VerticalMovementRule } from "../shared/src/chess/rules/vertical-movement.rule";

export class GameInitializer {
  public spawnPieces(board: Board) {
    this.spawnColor(board, Color.white);
    this.spawnColor(board, Color.black);
  }

  getDefaultPawnRules(color: Color) {
    return [
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
      new DiagonalMovementRule({
        moveToEmpty: false,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions:
          color == Color.black
            ? new Set<Direction>([Direction.DownRight, Direction.DownLeft])
            : new Set<Direction>([Direction.UpRight, Direction.UpLeft]),
      }),
    ];
  }
  getDefaultRookRules() {
    return [
      new VerticalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
    ];
  }
  getDefaultBishopRules() {
    return [];
  }
  getDefaultKnightRules() {
    return [
      new DiagonalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([
          Direction.UpLeft,
          Direction.DownLeft,
          Direction.UpRight,
          Direction.DownRight,
        ]),
      }),
    ];
  }
  getDefaultQueenRules() {
    return [
      new DiagonalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([
          Direction.UpLeft,
          Direction.DownLeft,
          Direction.UpRight,
          Direction.DownRight,
        ]),
      }),
      new VerticalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
    ];
  }
  getDefaultKingRules() {
    return [
      new DiagonalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions: new Set<Direction>([
          Direction.UpLeft,
          Direction.DownLeft,
          Direction.UpRight,
          Direction.DownRight,
        ]),
      }),
      new VerticalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      }),
    ];
  }

  spawnColor(board: Board, color: Color) {
    const spawnLine = color === Color.black ? 0 : 7;
    const pawnSpawnLine = color === Color.black ? spawnLine + 1 : spawnLine - 1;

    for (let i = 0; i < board.size; i++) {
      board.squares[pawnSpawnLine][i].putPiece(new Pawn(color, []));
    }
    board.squares[spawnLine][0].putPiece(
      new Rook(color, this.getDefaultRookRules())
    );
    board.squares[spawnLine][1].putPiece(
      new Knight(color, this.getDefaultKnightRules())
    );
    board.squares[spawnLine][2].putPiece(
      new Bishop(color, this.getDefaultBishopRules())
    );
    board.squares[spawnLine][3].putPiece(new King(color));
    board.squares[spawnLine][4].putPiece(new Queen(color));
    board.squares[spawnLine][5].putPiece(
      new Bishop(color, this.getDefaultBishopRules())
    );
    board.squares[spawnLine][6].putPiece(
      new Knight(color, this.getDefaultKnightRules())
    );
    board.squares[spawnLine][7].putPiece(
      new Rook(color, this.getDefaultRookRules())
    );
  }
}
