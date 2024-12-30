import {
  Coordinate,
  KnightMovementRule,
  PostMovementRule,
  TransformationOnPositionRule,
} from "../shared/src";
import { Board } from "../shared/src/chess/board/board";
import { BoardMeta } from "../shared/src/chess/board/board.types";
import { Color } from "../shared/src/chess/color";
import { PieceMeta } from "../shared/src/chess/piece/piece.types";
import { PieceType } from "../shared/src/chess/piece/piece.constants";
import { MovementRule } from "../shared/src/chess/rules/piece-movement/movement-rule";
import { DiagonalMovementRule } from "../shared/src/chess/rules/piece-movement/diagonal-movement.rule";
import { HorizontalMovementRule } from "../shared/src/chess/rules/piece-movement/horizontal-movement.rule";
import { PositionSpecificMovementRule } from "../shared/src/chess/rules/piece-movement/position-specific-movement.rule";
import { Direction } from "../shared/src/chess/rules/piece-movement/movement-rule";
import { VerticalMovementRule } from "../shared/src/chess/rules/piece-movement/vertical-movement.rule";
import { TakeOnThePassMovementRule } from "../shared/src/chess/rules/piece-movement/take-on-the-pass.rule";
import { CastlingMovementRule } from "../shared/src/chess/rules/piece-movement/castling.rule";
import { CheckMateGlobalRule } from "../shared/src/chess/rules/global/check-mate.global-rule";
import {
  MovementRules,
  PostMovementRules,
} from "../shared/src/chess/rules/piece-movement/movement-rules.const";
import { randomUUID } from "crypto";

export type Position = {
  [key in Color]: { type: PieceType; coordinate: Coordinate }[];
};

export class GameInitializer {
  private pawnDefaultTransformationTypes = [
    PieceType.Queen,
    PieceType.Rook,
    PieceType.Bishop,
    PieceType.Knight,
  ];
  getDefaultPawnRules(color: Color, withPostRulest: boolean = true) {
    const verticalDirection =
      color == Color.white
        ? new Set<Direction>([Direction.Down])
        : new Set<Direction>([Direction.Up]);

    const diagonalDirection =
      color == Color.white
        ? new Set<Direction>([Direction.DownRight, Direction.DownLeft])
        : new Set<Direction>([Direction.UpRight, Direction.UpLeft]);

    return {
      movementRules: [
        new VerticalMovementRule({
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 1,
          directions: verticalDirection,
          speed: 1,
        }),
        new DiagonalMovementRule({
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
          moveToEmpty: false,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: diagonalDirection,
          speed: 1,
        }),
        new PositionSpecificMovementRule({
          id: randomUUID(),
          name: MovementRules.PositionSpecificMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 2,
          speed: 2,
          directions: verticalDirection,
          activatePositions: {
            y: new Set<number>(color == Color.white ? [1] : [6]),
          },
        }),
        new TakeOnThePassMovementRule({
          id: randomUUID(),
          name: MovementRules.TakeOnThePassMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 1,
          speed: 1,
          directions: diagonalDirection,
          activatePositions: {
            y: new Set<number>(color == Color.white ? [4] : [3]),
          },
        }),
      ],
      postMovementRules: withPostRulest
        ? [
            new TransformationOnPositionRule({
              id: randomUUID(),
              name: PostMovementRules.TransformationOnPositionRule,
              color,
              maxCharges: 1,
              triggerOnY: color === Color.white ? 7 : 0,
              possiblePiecesTypes: this.pawnDefaultTransformationTypes,
            }),
          ]
        : [],
    };
  }
  getDefaultRookRules(color: Color) {
    return {
      movementRules: [
        new VerticalMovementRule({
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: new Set<Direction>([Direction.Up, Direction.Down]),
          speed: 1,
        }),
        new HorizontalMovementRule({
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: new Set<Direction>([Direction.Left, Direction.Right]),
          speed: 1,
        }),
      ],
    };
  }
  getDefaultBishopRules() {
    return {
      movementRules: [
        new DiagonalMovementRule({
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
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
      ],
    };
  }
  getDefaultKnightRules() {
    return {
      movementRules: [
        new KnightMovementRule({
          id: randomUUID(),
          name: MovementRules.KnightMovementRule,
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
      ],
    };
  }
  getDefaultQueenRules() {
    return {
      movementRules: [
        new DiagonalMovementRule({
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
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
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: new Set<Direction>([Direction.Up, Direction.Down]),
          speed: 1,
        }),
        new HorizontalMovementRule({
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: new Set<Direction>([Direction.Left, Direction.Right]),
          speed: 1,
        }),
      ],
    };
  }
  getDefaultKingsideCastling(color: Color) {
    const kingPos: Coordinate = color === Color.white ? [3, 0] : [3, 7];
    const rookPos: Coordinate = color === Color.white ? [0, 0] : [0, 7];

    return new CastlingMovementRule({
      id: randomUUID(),
      name: MovementRules.CastlingMovementRule,
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
      id: randomUUID(),
      name: MovementRules.CastlingMovementRule,
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
    return {
      movementRules: [
        new DiagonalMovementRule({
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
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
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: new Set<Direction>([Direction.Up, Direction.Down]),
          speed: 1,
        }),
        new HorizontalMovementRule({
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: new Set<Direction>([Direction.Left, Direction.Right]),
          speed: 1,
        }),
        this.getDefaultKingsideCastling(color),
        this.getDefaultQueenSideCastling(color),
      ],
    };
  }

  getDefaultGlobalRules(board: Board) {
    return [new CheckMateGlobalRule()];
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

  getDefaultRulesForPiece(
    type: PieceType,
    color: Color,
    withPostRulest: boolean = true
  ) {
    switch (type) {
      case PieceType.Pawn:
        return this.getDefaultPawnRules(color, withPostRulest);
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

  spawnBeforeTransformPostiion(board: Board) {
    const whitePawnSpawnLine = 4;
    const blackPawnSpawnLine = 3;
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

    for (let i = 0; i <= 7; i++) {
      // todo debug thing

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

  buildPieceMeta(
    type: PieceType,
    color: Color,
    withPostRulest: boolean = true
  ) {
    const rules = this.getDefaultRulesForPiece(
      type,
      color as Color,
      withPostRulest
    ) as any;

    return {
      type,
      color: color as Color,
      rules: rules.movementRules.map((rule: MovementRule) => rule.getMeta()),
      postMovementRulesMeta: rules.postMovementRules?.map(
        (rule: PostMovementRule) => rule.getMeta()
      ),
    } as PieceMeta;
  }

  spawnDefaultRulesCustomPosition(
    board: Board,
    position: Position,
    withPostRulest: boolean = true
  ) {
    const meta: BoardMeta = [];
    for (let i = 0; i < board.size; i++) {
      meta.push(new Array(board.size).fill(null));
    }
    for (const color in position) {
      for (const piece of position[color as Color]) {
        const { type, coordinate } = piece;
        const [x, y] = coordinate;
        meta[y][x] = this.buildPieceMeta(type, color as Color, withPostRulest);
      }
    }
    board.fillBoardByMeta(meta);

    const additionalMeta: PieceMeta[] = [];
    this.pawnDefaultTransformationTypes.forEach((type) => {
      additionalMeta.push(this.buildPieceMeta(type, Color.black));
      additionalMeta.push(this.buildPieceMeta(type, Color.white));
    });
    board.saveAdditionalMeta(additionalMeta);
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
