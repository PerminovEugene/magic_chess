import { Cell } from "../../cell";
import { Color, Pawn } from "../../piece";
import { Coordinate } from "../../types";
import { Direction } from "../movement-rule";
import { StraightMovementRuleConfig } from "../straight-movement.rule";
import { VerticalMovementRule } from "../vertical-movement.rule";

describe("VerticalMovementRule", () => {
  let rule: VerticalMovementRule;
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
    rule = new VerticalMovementRule({
      moveToEmpty: true,
      moveToKill: true,
      collision: true,
      distance: 2,
      directions: new Set<Direction>([Direction.Up, Direction.Down]),
      speed: 1,
      ...config,
    });
  };

  beforeEach(() => {
    // updateRule();
    squares = getDefaultCells();
  });

  const checkMoves = (moves: Coordinate[], expectedMoves: Coordinate[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toContainNestedArray(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;

    it("should return available moves for upward direction", () => {
      updateRule({ directions: new Set<Direction>([Direction.Up]) });
      const expectedMoves: Coordinate[] = [
        [2, 0],
        [2, 1],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves for downward direction", () => {
      updateRule({ directions: new Set<Direction>([Direction.Down]) });
      const expectedMoves: Coordinate[] = [
        [2, 3],
        [2, 4],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves for upward and backward directions", () => {
      updateRule({
        directions: new Set<Direction>([Direction.Down, Direction.Up]),
      });
      const expectedMoves: Coordinate[] = [
        [2, 3],
        [2, 4],
        [2, 0],
        [2, 1],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check close to the edge ", () => {
    it("should return available moves for upward direction", () => {
      const fromX = 2;
      const fromY = 1;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({ directions: new Set<Direction>([Direction.Up]) });
      const expectedMoves: Coordinate[] = [[2, 0]];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves for downward direction", () => {
      const fromX = 2;
      const fromY = 3;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({ directions: new Set<Direction>([Direction.Down]) });
      const expectedMoves: Coordinate[] = [[2, 4]];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check at the edge ", () => {
    it("should return available moves for upward direction", () => {
      const fromX = 2;
      const fromY = 0;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({ directions: new Set<Direction>([Direction.Up]) });
      const expectedMoves: Coordinate[] = [];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves for downward direction", () => {
      const fromX = 2;
      const fromY = 4;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({ directions: new Set<Direction>([Direction.Down]) });
      const expectedMoves: Coordinate[] = [];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check near other pieces", () => {
    it("should return available moves when alied pieces are close", () => {
      const fromX = 2;
      const fromY = 2;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        directions: new Set<Direction>([Direction.Down, Direction.Up]),
      });
      squares[0][2].putPiece(new Pawn(Color.white));
      squares[3][2].putPiece(new Pawn(Color.white));

      const expectedMoves: Coordinate[] = [[2, 1]];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when enemy pieces are close and can moveToKill", () => {
      const fromX = 2;
      const fromY = 2;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        directions: new Set<Direction>([Direction.Down, Direction.Up]),
      });
      squares[0][2].putPiece(new Pawn(Color.black));
      squares[3][2].putPiece(new Pawn(Color.black));

      const expectedMoves: Coordinate[] = [
        [2, 0],
        [2, 1],
        [2, 3],
      ];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when enemy pieces are close and can not moveToKill", () => {
      const fromX = 2;
      const fromY = 2;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        moveToKill: false,
        directions: new Set<Direction>([Direction.Down, Direction.Up]),
      });
      squares[0][2].putPiece(new Pawn(Color.black));
      squares[3][2].putPiece(new Pawn(Color.black));

      const expectedMoves: Coordinate[] = [[2, 1]];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });
});
