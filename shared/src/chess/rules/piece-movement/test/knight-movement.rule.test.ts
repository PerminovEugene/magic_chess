import { Cell } from "../../../cell";
import { Color } from "../../../color";
import { Pawn, Knight } from "../../../pieces";
import { Coordinate } from "../../../coordinate";
import { KnightMovementRule } from "../knight-movement.rule";
import { AvailableMove, Direction } from "../movement-rule";
import { StraightMovementRuleConfig } from "../straight-movement.rule";
import { AffectType } from "../../../affect.types";
import { MovementRules } from "../movement-rules.const";

describe("KnightMovementRule", () => {
  let rule: KnightMovementRule;
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
  const updateRule = (config?: Partial<StraightMovementRuleConfig>) => {
    rule = new KnightMovementRule({
      name: MovementRules.KnightMovementRule,
      moveToEmpty: true,
      moveToKill: true,
      collision: true,
      distance: 1,
      directions: new Set<Direction>([
        Direction.UpRight,
        Direction.UpLeft,
        Direction.DownRight,
        Direction.DownLeft,
        Direction.Up,
        Direction.Down,
        Direction.Right,
        Direction.Left,
      ]),
      ...config,
      speed: 1,
    });
  };

  beforeEach(() => {
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

    it("should return available moves", () => {
      updateRule();
      const expectedMoves: Coordinate[] = [
        [1, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 3],
        [4, 3],
        [1, 4],
        [3, 4],
      ];
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check close to the edge ", () => {
    it("should return available moves from the corner", () => {
      const fromX = 0;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();
      const expectedMoves: Coordinate[] = [
        [2, 1],
        [1, 2],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check near other pieces", () => {
    it("should return available moves when alied pieces are close", () => {
      const fromX = 0;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();

      squares[2][1].putPiece(new Pawn(Color.white));
      squares[1][2].putPiece(new Pawn(Color.white));

      const expectedMoves: Coordinate[] = [];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when enemy pieces are close and can moveToKill", () => {
      const fromX = 0;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();

      squares[2][1].putPiece(new Pawn(Color.black));
      squares[1][2].putPiece(new Pawn(Color.black));

      const expectedMoves: AvailableMove[] = [
        [2, 1, [{ type: AffectType.kill, from: [2, 1] }]],
        [1, 2, [{ type: AffectType.kill, from: [1, 2] }]],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });
});
