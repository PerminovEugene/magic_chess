import { Coordinate } from "../shared/src";
import { Color } from "../shared/src/chess/color";
import { PieceType } from "../shared/src/chess/piece/piece.constants";
import { Direction } from "../shared/src/chess/rules/piece-movement/movement-rule";
import {
  MovementRules,
  PostMovementRules,
} from "../shared/src/chess/rules/piece-movement/movement-rules.const";
import { randomUUID } from "crypto";

export class RulesRepository {
  private pawnDefaultTransformationTypes = [
    PieceType.Queen,
    PieceType.Rook,
    PieceType.Bishop,
    PieceType.Knight,
  ];

  getPawnTransformationPieces() {
    return this.pawnDefaultTransformationTypes;
  }

  getDefaultPawnRules(color: Color, withPostRulest: boolean = true) {
    const verticalDirection =
      color == Color.white ? [Direction.Down] : [Direction.Up];

    const diagonalDirection =
      color == Color.white
        ? [Direction.DownRight, Direction.DownLeft]
        : [Direction.UpRight, Direction.UpLeft];

    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 1,
          directions: verticalDirection,
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
          moveToEmpty: false,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: diagonalDirection,
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.PositionSpecificMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 2,
          speed: 2,
          directions: verticalDirection,
          activatePositions: {
            y: color == Color.white ? [1] : [6],
          },
        },
        {
          id: randomUUID(),
          name: MovementRules.TakeOnThePassMovementRule,
          moveToEmpty: true,
          moveToKill: false,
          collision: true,
          distance: 1,
          speed: 1,
          directions: diagonalDirection,
          activatePositions: {
            y: color == Color.white ? [4] : [3],
          },
        },
      ],
      postMovementRules: withPostRulest
        ? [
            {
              id: randomUUID(),
              name: PostMovementRules.TransformationOnPositionRule,
              color,
              maxCharges: 1,
              triggerOnY: color === Color.white ? 7 : 0,
              possiblePiecesTypes: this.pawnDefaultTransformationTypes,
            },
          ]
        : [],
    };
  }
  getDefaultRookRules() {
    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [Direction.Up, Direction.Down],
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [Direction.Left, Direction.Right],
          speed: 1,
        },
      ],
    };
  }
  getDefaultBishopRules() {
    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [
            Direction.UpLeft,
            Direction.DownLeft,
            Direction.UpRight,
            Direction.DownRight,
          ],
          speed: 1,
        },
      ],
    };
  }
  getDefaultKnightRules() {
    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.KnightMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: false,
          distance: 1,
          directions: [
            Direction.UpLeft,
            Direction.DownLeft,
            Direction.UpRight,
            Direction.DownRight,
            Direction.Up,
            Direction.Down,
            Direction.Right,
            Direction.Left,
          ],
          speed: 1,
        },
      ],
    };
  }
  getDefaultQueenRules() {
    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [
            Direction.UpLeft,
            Direction.DownLeft,
            Direction.UpRight,
            Direction.DownRight,
          ],
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [Direction.Up, Direction.Down],
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 8,
          directions: [Direction.Left, Direction.Right],
          speed: 1,
        },
      ],
    };
  }
  getDefaultKingsideCastling(color: Color) {
    const kingPos: Coordinate = color === Color.white ? [3, 0] : [3, 7];
    const rookPos: Coordinate = color === Color.white ? [0, 0] : [0, 7];

    return {
      id: randomUUID(),
      name: MovementRules.CastlingMovementRule,
      moveToEmpty: true,
      moveToKill: false,
      collision: true,
      distance: 2,
      directions: [Direction.Right, Direction.Left],
      speed: 1,
      color: color,
      mainPieceCoordinate: kingPos,
      foreginPieceCoordinate: rookPos,
    };
  }
  getDefaultQueenSideCastling(color: Color) {
    const kingPos: Coordinate = color === Color.white ? [3, 0] : [3, 7];
    const rookPos: Coordinate = color === Color.white ? [7, 0] : [7, 7];
    return {
      id: randomUUID(),
      name: MovementRules.CastlingMovementRule,
      moveToEmpty: true,
      moveToKill: false,
      collision: true,
      distance: 2,
      directions: [Direction.Right, Direction.Left],
      speed: 1,
      color: color,
      mainPieceCoordinate: kingPos,
      foreginPieceCoordinate: rookPos,
    };
  }
  getDefaultKingRules(color: Color) {
    return {
      movementRules: [
        {
          id: randomUUID(),
          name: MovementRules.DiagonalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: [
            Direction.UpLeft,
            Direction.DownLeft,
            Direction.UpRight,
            Direction.DownRight,
          ],
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.VerticalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: [Direction.Up, Direction.Down],
          speed: 1,
        },
        {
          id: randomUUID(),
          name: MovementRules.HorizontalMovementRule,
          moveToEmpty: true,
          moveToKill: true,
          collision: true,
          distance: 1,
          directions: [Direction.Left, Direction.Right],
          speed: 1,
        },
        this.getDefaultKingsideCastling(color),
        this.getDefaultQueenSideCastling(color),
      ],
    };
  }
}
