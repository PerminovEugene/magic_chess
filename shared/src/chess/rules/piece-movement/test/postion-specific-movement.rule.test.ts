import { Cell } from "../../../cell";
import { Color } from "../../../color";
import { Pawn } from "../../../pieces";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "../position-specific-movement.rule";
import { AvailableMove, Direction } from "../movement-rule";
import { Coordinate } from "../../../coordinate";
import { MovementRules } from "../movement-rules.const";

describe("PositionSpecificMovementRule with speed 2 (like for pawn)", () => {
  let rule: PositionSpecificMovementRule;
  let squares: Cell[][];
  const getPiece = (x: number, y: number) => squares[y][x].getPiece();
  const size = 5;
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
      name: MovementRules.PositionSpecificMovementRule,
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

  const checkMoves = (moves: AvailableMove[], expectedMoves: Coordinate[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).isEqlAvailableMoves(expectedMoves);
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

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return empty available moves when position is not for activation by x", () => {
      const expectedMoves: Coordinate[] = [];

      updateRule({
        activatePositions: {
          x: new Set<number>([fromX + 1]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);
      checkMoves(moves, expectedMoves);
    });

    it("should return empty available moves when position is not for activation by y", () => {
      const expectedMoves: Coordinate[] = [];

      updateRule({
        activatePositions: {
          y: new Set<number>([fromY + 1]),
        },
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);
      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when position is for activation by x", () => {
      const expectedMoves: Coordinate[] = [[fromX + speed, fromY]];

      updateRule({
        activatePositions: {
          x: new Set<number>([fromX]),
        },
        directions: new Set<Direction>([Direction.Left, Direction.Right]),
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves2 = rule.availableMoves(fromX, fromY, getPiece, [], size);
      checkMoves(moves2, expectedMoves);
    });

    it("should return available moves when position is for activation by y", () => {
      const expectedMoves: Coordinate[] = [[fromX, fromY + speed]];

      updateRule({
        activatePositions: {
          y: new Set<number>([fromY]),
        },
        directions: new Set<Direction>([Direction.Up, Direction.Down]),
      });
      squares[fromY][fromX].putPiece(new Pawn(Color.white));
      const moves2 = rule.availableMoves(fromX, fromY, getPiece, [], size);
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

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return all diagonal moves", () => {
      const fromX = 2;
      const fromY = 2;
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        activatePositions: {
          x: new Set([fromX]),
          y: new Set([fromY]),
        },
        directions: new Set<Direction>([
          Direction.UpRight,
          Direction.DownRight,
          Direction.UpLeft,
          Direction.DownLeft,
        ]),
      });
      const expectedMoves: Coordinate[] = [
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });
});
