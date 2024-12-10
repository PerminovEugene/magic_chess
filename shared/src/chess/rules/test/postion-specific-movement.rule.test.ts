import { Cell } from "../../cell";
import { Color, Pawn } from "../../piece";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "../position-specific-movement.rule";
import { Direction } from "../movement-rule";
import { Coordinate } from "../../types";

describe("PositionSpecificMovementRule with speed 2 (like for pawn)", () => {
  let rule: PositionSpecificMovementRule;
  let squares: Cell[][];

  const speed = 2;

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
    rule = new PositionSpecificMovementRule({
      moveToEmpty: true,
      moveToKill: true,
      collision: true,
      distance: 2,
      speed,
      directions: new Set<Direction>([
        Direction.Up,
        Direction.Down,
        Direction.Left,
        Direction.Right,
      ]),
      activatePositions: {
        y: new Set<number>([1]),
        x: new Set<number>([1]),
      },
      ...config,
    });
  };

  beforeEach(() => {
    squares = getDefaultCells();
  });

  const checkMoves = (moves: Coordinate[], expectedMoves: Coordinate[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toContainNestedArray(expectedMoves);
  };

  describe("check from the position for activation near border", () => {
    const fromX = 1;
    const fromY = 1;

    it("should return available moves 1-3 and 3-1", () => {
      updateRule({
        activatePositions: {
          y: new Set<number>([fromX]),
          x: new Set<number>([fromY]),
        },
      });
      const expectedMoves: Coordinate[] = [
        [1, 3],
        [3, 1],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });

    it("should return empty available moves when position is not for activation by x", () => {
      const expectedMoves: Coordinate[] = [];

      updateRule({
        activatePositions: {
          // y: new Set<number>([fromX + 1]),
          x: new Set<number>([fromX + 1]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves = rule.availableMoves(fromX, fromY, squares);
      checkMoves(moves, expectedMoves);
    });

    it("should return empty available moves when position is not for activation by y", () => {
      const expectedMoves: Coordinate[] = [];

      updateRule({
        activatePositions: {
          y: new Set<number>([fromY + 1]),
          // x: new Set<number>([fromY]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves = rule.availableMoves(fromX, fromY, squares);
      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when position is for activation by x", () => {
      const expectedMoves: Coordinate[] = [[fromX + speed, fromY]];

      updateRule({
        activatePositions: {
          // y: new Set<number>([fromX]),
          x: new Set<number>([fromX]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves2 = rule.availableMoves(fromX, fromY, squares);
      checkMoves(moves2, expectedMoves);
    });

    it("should return available moves when position is for activation by y", () => {
      const expectedMoves: Coordinate[] = [[fromX, fromY + speed]];

      updateRule({
        activatePositions: {
          y: new Set<number>([fromY]),
          // x: new Set<number>([fromY]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves2 = rule.availableMoves(fromX, fromY, squares);
      checkMoves(moves2, expectedMoves);
    });
  });

  describe("check at the middle in all directions and in activated position", () => {
    it("should return all available moves", () => {
      const fromX = 2;
      const fromY = 2;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        activatePositions: {
          x: new Set([2]),
          y: new Set([2]),
        },
      });
      const expectedMoves: Coordinate[] = [
        [2, 0],
        [0, 2],
        [4, 2],
        [2, 4],
      ];

      const moves = rule.availableMoves(fromX, fromY, squares);

      checkMoves(moves, expectedMoves);
    });
  });
});
