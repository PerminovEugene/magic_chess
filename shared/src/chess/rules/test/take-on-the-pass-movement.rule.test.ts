import { Cell } from "../../cell";
import { Color, Pawn, PieceType } from "../../piece";
import { Coordinate } from "../../types";
import { AffectType, AvailableMove, Direction } from "../movement-rule";
import { PositionSpecificMovementRuleConfig } from "../position-specific-movement.rule";
import { TakeOnThePassMovementRule } from "../take-on-the-pass.rule";
import { TurnType } from "../../game";

describe("VerticalMovementRule", () => {
  let rule: TakeOnThePassMovementRule;
  let squares: Cell[][];

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

  const checkMoves = (
    moves: AvailableMove[],
    expectedMoves: AvailableMove[]
  ) => {
    expect(moves).toHaveLength(expectedMoves.length);

    expect(moves).isEqlAvailableMoves(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;

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
      const expectedMoves: AvailableMove[] = [
        [1, 1, [{ type: AffectType.kill, from: enemyPawnTo }]],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.black));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.white));

      const turns = [
        {
          from: enemyPawnFrom,
          to: enemyPawnTo,
          pieceType: PieceType.Pawn,
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, squares, turns);
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
      const expectedMoves: AvailableMove[] = [
        [3, 1, [{ type: AffectType.kill, from: enemyPawnTo }]],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.black));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.white));

      const turns = [
        {
          from: enemyPawnFrom,
          to: enemyPawnTo,
          pieceType: PieceType.Pawn,
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, squares, turns);
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
      const expectedMoves: AvailableMove[] = [
        [1, 3, [{ type: AffectType.kill, from: enemyPawnTo }]],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.black));

      const turns = [
        {
          from: enemyPawnFrom,
          to: enemyPawnTo,
          pieceType: PieceType.Pawn,
          color: Color.black,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, squares, turns);
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
      const expectedMoves: AvailableMove[] = [
        [3, 3, [{ type: AffectType.kill, from: enemyPawnTo }]],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      squares[enemyPawnTo[1]][enemyPawnTo[0]].putPiece(new Pawn(Color.black));

      const turns = [
        {
          from: enemyPawnFrom,
          to: enemyPawnTo,
          pieceType: PieceType.Pawn,
          color: Color.white,
          type: TurnType.Move,
          timestamp: new Date().toISOString(),
        },
      ];

      const moves = rule.availableMoves(fromX, fromY, squares, turns);
      checkMoves(moves, expectedMoves);
    });
  });
});
