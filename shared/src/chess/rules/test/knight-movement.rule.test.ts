import { Cell } from "../../cell";
import { Color, Knight, Pawn } from "../../piece";
import { KnightMovementRule } from "../knight-movement.rule";
import { Direction } from "../rules";
import { StraightMovementRuleConfig } from "../straight-movement.rule";

describe("KnightMovementRule", () => {
  let rule: KnightMovementRule;
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
  const updateRule = (config?: Partial<StraightMovementRuleConfig>) => {
    rule = new KnightMovementRule({
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
    });
  };

  beforeEach(() => {
    squares = getDefaultCells();
  });

  const checkMoves = (
    moves: [number, number][],
    expectedMoves: [number, number][]
  ) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toContainNestedArray(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;

    it("should return available moves", () => {
      updateRule();
      const expectedMoves: [number, number][] = [
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

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check close to the edge ", () => {
    it("should return available moves from the corner", () => {
      const fromX = 0;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();
      const expectedMoves: [number, number][] = [
        [2, 1],
        [1, 2],
      ];

      const moves = rule.availableMoves(fromX, fromY, squares);

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

      const expectedMoves: [number, number][] = [];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when enemy pieces are close and can moveToKill", () => {
      const fromX = 0;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();

      squares[2][1].putPiece(new Pawn(Color.black));
      squares[1][2].putPiece(new Pawn(Color.black));

      const expectedMoves: [number, number][] = [
        [2, 1],
        [1, 2],
      ];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });
});
