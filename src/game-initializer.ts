import {
  CheckMateGlobalRule,
  Coordinate,
  KnightMovementRule,
} from "../shared/src";
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
import { DiagonalMovementRule } from "../shared/src/chess/rules/piece-movement/diagonal-movement.rule";
import { HorizontalMovementRule } from "../shared/src/chess/rules/piece-movement/horizontal-movement.rule";
import { PositionSpecificMovementRule } from "../shared/src/chess/rules/piece-movement/position-specific-movement.rule";
import { Direction } from "../shared/src/chess/rules/piece-movement/movement-rule";
import { VerticalMovementRule } from "../shared/src/chess/rules/piece-movement/vertical-movement.rule";
import { TakeOnThePassMovementRule } from "../shared/src/chess/rules/piece-movement/take-on-the-pass.rule";
import { CastlingMovementRule } from "../shared/src/chess/rules/piece-movement/castling.rule";
import { PieceType } from "../shared/src/chess/piece";
import { CheckMateGlobalRule2 } from "../shared/src/chess/rules/global/check-mate.global-rule copy";

export type Position = {
  [key in Color]: { type: PieceType; coordinate: Coordinate }[];
};

export class GameInitializer {
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
  getDefaultRookRules(color: Color) {
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
      color === Color.black
        ? this.getDefaultQueenSideCastling(color)
        : this.getDefaultKingsideCastling(color),
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
  getDefaultKingsideCastling(color: Color) {
    const kingPos: Coordinate = color === Color.white ? [3, 0] : [3, 7];
    const rookPos: Coordinate = color === Color.white ? [0, 0] : [0, 7];

    return new CastlingMovementRule({
      moveToEmpty: true,
      moveToKill: false,
      collision: true,
      distance: 2,
      directions: new Set<Direction>([Direction.Right, Direction.Left]),
      speed: 1,
      color: color,
      mainPieceCoordinate: kingPos,
      foreginPieceCoordinate: rookPos,
    });
  }
  getDefaultQueenSideCastling(color: Color) {
    const kingPos: Coordinate = color === Color.white ? [3, 0] : [3, 7];
    const rookPos: Coordinate = color === Color.white ? [7, 0] : [7, 7];
    return new CastlingMovementRule({
      moveToEmpty: true,
      moveToKill: false,
      collision: true,
      distance: 2,
      directions: new Set<Direction>([Direction.Right, Direction.Left]),
      speed: 1,
      color: color,
      mainPieceCoordinate: kingPos,
      foreginPieceCoordinate: rookPos,
    });
  }
  getDefaultKingRules(color: Color) {
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
      this.getDefaultKingsideCastling(color),
      this.getDefaultQueenSideCastling(color),
    ];
  }

  getDefaultGlobalRules(board: Board) {
    return [new CheckMateGlobalRule2(board)];
  }

  spawnDefaultRulesAndDefaultPosition(board: Board) {
    const whitePawnSpawnLine = 1;
    const blackPawnSpawnLine = 6;
    const whiteSpawnLine = 0;
    const blackSpawnLine = 7;

    const position: Position = {
      [Color.white]: [
        { type: PieceType.Rook, coordinate: [0, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, whiteSpawnLine] },
        { type: PieceType.King, coordinate: [3, whiteSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, whiteSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, whiteSpawnLine] },
      ],
      [Color.black]: [
        { type: PieceType.Rook, coordinate: [0, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, blackSpawnLine] },
        { type: PieceType.King, coordinate: [3, blackSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, blackSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, blackSpawnLine] },
      ],
    };

    for (let i = 3; i <= 3; i++) {
      // todo debug thing

      // for (let i = 0; i <= 7; i++) {
      position[Color.white].push({
        type: PieceType.Pawn,
        coordinate: [i, whitePawnSpawnLine],
      });
      position[Color.black].push({
        type: PieceType.Pawn,
        coordinate: [i, blackPawnSpawnLine],
      });
    }

    this.spawnDefaultRulesCustomPosition(board, position);
    return position;
  }

  // spawnDefaultRulesAndDefaultPositionForColor(board: Board, color: Color) {
  //   const spawnLine = color === Color.white ? 0 : 7;
  //   const pawnSpawnLine = color === Color.white ? spawnLine + 1 : spawnLine - 1;

  //   for (let i = 0; i < board.size; i++) {
  //     board.squares[pawnSpawnLine][i].putPiece(
  //       new Pawn(color, this.getDefaultPawnRules(color))
  //     );
  //   }
  //   board.squares[spawnLine][0].putPiece(
  //     new Rook(color, [
  //       ...this.getDefaultRookRules(),
  //       color === Color.black
  //         ? this.getDefaultQueenSideCastling(color)
  //         : this.getDefaultKingsideCastling(color),
  //     ])
  //   );
  //   board.squares[spawnLine][1].putPiece(
  //     new Knight(color, this.getDefaultKnightRules())
  //   );
  //   board.squares[spawnLine][2].putPiece(
  //     new Bishop(color, this.getDefaultBishopRules())
  //   );
  //   board.squares[spawnLine][4].putPiece(
  //     new Queen(color, this.getDefaultQueenRules())
  //   );
  //   board.squares[spawnLine][3].putPiece(
  //     new King(color, this.getDefaultKingRules(color))
  //   );
  //   board.squares[spawnLine][5].putPiece(
  //     new Bishop(color, this.getDefaultBishopRules())
  //   );
  //   board.squares[spawnLine][6].putPiece(
  //     new Knight(color, this.getDefaultKnightRules())
  //   );
  //   board.squares[spawnLine][7].putPiece(
  //     new Rook(color, [
  //       ...this.getDefaultRookRules(),
  //       color === Color.white
  //         ? this.getDefaultQueenSideCastling(color)
  //         : this.getDefaultKingsideCastling(color),
  //     ])
  //   );
  // }

  getRulesForPiece(type: PieceType, color: Color) {
    switch (type) {
      case PieceType.Pawn:
        return this.getDefaultPawnRules(color);
      case PieceType.Rook:
        return this.getDefaultRookRules(color);
      case PieceType.Bishop:
        return this.getDefaultBishopRules();
      case PieceType.Knight:
        return this.getDefaultKnightRules();
      case PieceType.Queen:
        return this.getDefaultQueenRules();
      case PieceType.King:
        return this.getDefaultKingRules(color);
    }
  }

  private mapper = {
    [PieceType.Pawn]: Pawn,
    [PieceType.Bishop]: Bishop,
    [PieceType.Knight]: Knight,
    [PieceType.Rook]: Rook,
    [PieceType.Queen]: Queen,
    [PieceType.King]: King,
  };

  spawnDefaultRulesCustomPosition(board: Board, position: Position) {
    for (const color in position) {
      for (const piece of position[color as Color]) {
        const { type, coordinate } = piece;
        const [x, y] = coordinate;
        const rules = this.getRulesForPiece(type, color as Color);
        board.squares[y][x].putPiece(
          new this.mapper[type](color as Color, rules)
        );
      }
    }
  }
}

// for (let i = 0; i < board.size; i++) {
//   board.squares[pawnSpawnLine][i].putPiece(
//     new Pawn(color, this.getDefaultPawnRules(color))
//   );
// }
// board.squares[spawnLine][0].putPiece(
//   new Rook(color, [
//     ...this.getDefaultRookRules(),
//     color === Color.black
//       ? this.getDefaultQueenSideCastling(color)
//       : this.getDefaultKingsideCastling(color),
//   ])
// );
//   board.squares[spawnLine][1].putPiece(
//     new Knight(color, this.getDefaultKnightRules())
//   );
//   board.squares[spawnLine][2].putPiece(
//     new Bishop(color, this.getDefaultBishopRules())
//   );
//   board.squares[spawnLine][4].putPiece(
//     new Queen(color, this.getDefaultQueenRules())
//   );
//   board.squares[spawnLine][3].putPiece(
//     new King(color, this.getDefaultKingRules(color))
//   );
//   board.squares[spawnLine][5].putPiece(
//     new Bishop(color, this.getDefaultBishopRules())
//   );
//   board.squares[spawnLine][6].putPiece(
//     new Knight(color, this.getDefaultKnightRules())
//   );
//   board.squares[spawnLine][7].putPiece(
//     new Rook(color, [
//       ...this.getDefaultRookRules(),
//       color === Color.white
//         ? this.getDefaultQueenSideCastling(color)
//         : this.getDefaultKingsideCastling(color),
//     ])
//   );
// }
