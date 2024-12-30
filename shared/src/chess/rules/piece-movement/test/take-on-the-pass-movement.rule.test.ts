import { Cell } from "../../../cell";
import { PieceType } from "../../../piece/piece.constants";
import { Coordinate } from "../../../coordinate";
import { Action, Direction } from "../movement-rule";
import { PositionSpecificMovementRuleConfig } from "../position-specific-movement.rule";
import { TakeOnThePassMovementRule } from "../take-on-the-pass.rule";
import { Turn, TurnType } from "../../../turn";
import { Pawn } from "../../../piece/pieces";
import { Color } from "../../../color";
import { MovementRules } from "../movement-rules.const";
import {
  buildKillAffect,
  buildMoveAffect,
  markAsUserSelected,
} from "../../../affect/affect.utils";
import { randomUUID } from "crypto";

describe("TakeOnThePassMovementRule", () => {
  let rule: TakeOnThePassMovementRule;
  let squares: Cell[][];
  const getPiece = (x: number, y: number) => squares[y][x].getPiece();
  const size = 5;

  const getDefaultCells = () => {
    return [
      [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()],
    ];
  };
  const updateRule = (config?: Partial<PositionSpecificMovementRuleConfig>) => {
    rule = new TakeOnThePassMovementRule({
      id: randomUUID(), // this
      name: MovementRules.TakeOnThePassMovementRule,
      moveToEmpty: true,
      moveToKill: true,
      collision: true,
      distance: 1,
      directions: new Set<Direction>([Direction.UpLeft, Direction.UpRight]),
      speed: 1,
      activatePositions: {
        y: new Set<number>([2]),
      },
      ...config,
    });
  };

  beforeEach(() => {
    // updateRule();
    squares = getDefaultCells();
  });

  const checkMoves = (moves: Action[], expectedMoves: Action[]) => {
    expect(moves).toHaveLength(expectedMoves.length);

    expect(moves).isEqlAvailableMoves(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;
    const from: Coordinate = [fromX, fromY];

    /**
     * |_|w|_|_|_|
     * |_|B|_|_|_|
     * |_|W|b|_|_|
     * |_|_|_|_|_|
     * |_|_|_|_|_|
     */
    it("should return available moves for UpLeft direction", () => {
      updateRule();
      const enemyPawnFrom: Coordinate = [1, 0];
      const enemyPawnTo: Coordinate = [1, 2];
      const expectedMoves: Action[] = [
        [
          buildKillAffect(enemyPawnTo),
          markAsUserSelected(buildMoveAffect(from, [1, 1])),
        ],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.black));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.white));

      const turns = [
        {
          affects: [
            markAsUserSelected(buildMoveAffect(enemyPawnFrom, enemyPawnTo)),
          ],
          pieceType: PieceType.Pawn,
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        } as Turn,
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, turns, size);
      checkMoves(moves, expectedMoves);
    });

    /**
     * |_|_|_|w|_|
     * |_|_|_|B|_|
     * |_|_|b|W|_|
     * |_|_|_|_|_|
     * |_|_|_|_|_|
     */
    it("should return available moves for UpRight direction", () => {
      updateRule();
      const enemyPawnFrom: Coordinate = [3, 0];
      const enemyPawnTo: Coordinate = [3, 2];
      const expectedMoves: Action[] = [
        [
          buildKillAffect(enemyPawnTo),
          markAsUserSelected(buildMoveAffect(from, [3, 1])),
        ],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.black));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.white));

      const turns = [
        {
          pieceType: PieceType.Pawn,
          affects: [
            markAsUserSelected(buildMoveAffect(enemyPawnFrom, enemyPawnTo)),
          ],
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, turns, size);
      checkMoves(moves, expectedMoves);
    });

    /**
     * |_|_|_|_|_|
     * |_|_|_|_|_|
     * |_|B|w|_|_|
     * |_|W|_|_|_|
     * |_|b|_|_|_|
     */
    it("should return available moves for DownLeft direction", () => {
      updateRule({
        directions: new Set<Direction>([Direction.DownLeft]),
      });
      const enemyPawnFrom: Coordinate = [1, 4];
      const enemyPawnTo: Coordinate = [1, 2];
      const expectedMoves: Action[] = [
        [
          buildKillAffect(enemyPawnTo),
          markAsUserSelected(buildMoveAffect(from, [1, 3])),
        ],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.black));

      const turns = [
        {
          pieceType: PieceType.Pawn,
          affects: [
            markAsUserSelected(buildMoveAffect(enemyPawnFrom, enemyPawnTo)),
          ],
          color: Color.black,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, turns, size);
      checkMoves(moves, expectedMoves);
    });

    /**
     * |_|_|_|_|_|
     * |_|_|_|_|_|
     * |_|_|w|B|_|
     * |_|_|_|W|_|
     * |_|_|_|b|_|
     */
    it("should return available moves for DownRight direction", () => {
      updateRule({ directions: new Set<Direction>([Direction.DownRight]) });
      const enemyPawnFrom: Coordinate = [3, 4];
      const enemyPawnTo: Coordinate = [3, 2];
      const expectedMoves: Action[] = [
        [
          buildKillAffect(enemyPawnTo),
          markAsUserSelected(buildMoveAffect(from, [3, 3])),
        ],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.black));

      const turns = [
        {
          affects: [
            markAsUserSelected(buildMoveAffect(enemyPawnFrom, enemyPawnTo)),
          ],
          pieceType: PieceType.Pawn,
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, turns, size);
      checkMoves(moves, expectedMoves);
    });
  });
});
