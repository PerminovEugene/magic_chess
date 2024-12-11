import { KnightMovementRule } from "../shared/src";
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
import { PositionSpecificMovementRule } from "../shared/src/chess/rules/position-specific-movement.rule";
import { Direction } from "../shared/src/chess/rules/movement-rule";
import { VerticalMovementRule } from "../shared/src/chess/rules/vertical-movement.rule";
import { TakeOnThePassMovementRule } from "../shared/src/chess/rules/take-on-the-pass.rule";

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
          color == Color.white
            ? new Set<Direction>([Direction.Down])
            : new Set<Direction>([Direction.Up]),
        speed: 1,
      }),
      new DiagonalMovementRule({
        moveToEmpty: false,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions:
          color == Color.white
            ? new Set<Direction>([Direction.DownRight, Direction.DownLeft])
            : new Set<Direction>([Direction.UpRight, Direction.UpLeft]),
        speed: 1,
      }),
      new PositionSpecificMovementRule({
        moveToEmpty: true,
        moveToKill: false,
        collision: true,
        distance: 2,
        speed: 2,
        directions:
          color == Color.white
            ? new Set<Direction>([Direction.Down])
            : new Set<Direction>([Direction.Up]),
        activatePositions: {
          y: new Set<number>(color == Color.white ? [1] : [6]),
        },
      }),
      new TakeOnThePassMovementRule({
        moveToEmpty: true,
        moveToKill: false,
        collision: true,
        distance: 1,
        speed: 1,
        directions:
          color == Color.white
            ? new Set<Direction>([Direction.DownLeft, Direction.DownRight])
            : new Set<Direction>([Direction.UpLeft, Direction.UpRight]),
        activatePositions: {
          y: new Set<number>(color == Color.white ? [4] : [3]),
        },
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
        speed: 1,
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Left, Direction.Right]),
        speed: 1,
      }),
    ];
  }
  getDefaultBishopRules() {
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
        speed: 1,
      }),
    ];
  }
  getDefaultKnightRules() {
    return [
      new KnightMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: false,
        distance: 1,
        directions: new Set<Direction>([
          Direction.UpLeft,
          Direction.DownLeft,
          Direction.UpRight,
          Direction.DownRight,
          Direction.Up,
          Direction.Down,
          Direction.Right,
          Direction.Left,
        ]),
        speed: 1,
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
        speed: 1,
      }),
      new VerticalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
        speed: 1,
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 8,
        directions: new Set<Direction>([Direction.Left, Direction.Right]),
        speed: 1,
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
        speed: 1,
      }),
      new VerticalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
        speed: 1,
      }),
      new HorizontalMovementRule({
        moveToEmpty: true,
        moveToKill: true,
        collision: true,
        distance: 1,
        directions: new Set<Direction>([Direction.Left, Direction.Right]),
        speed: 1,
      }),
    ];
  }

  spawnColor(board: Board, color: Color) {
    const spawnLine = color === Color.white ? 0 : 7;
    const pawnSpawnLine = color === Color.white ? spawnLine + 1 : spawnLine - 1;

    for (let i = 0; i < board.size; i++) {
      board.squares[pawnSpawnLine][i].putPiece(
        new Pawn(color, this.getDefaultPawnRules(color))
      );
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
    board.squares[spawnLine][4].putPiece(
      new Queen(color, this.getDefaultQueenRules())
    );
    board.squares[spawnLine][3].putPiece(
      new King(color, this.getDefaultKingRules())
    );
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
