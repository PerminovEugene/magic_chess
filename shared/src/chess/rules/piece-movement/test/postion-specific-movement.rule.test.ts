import { Cell } from "../../../cell";
import { Color } from "../../../color";
import { Pawn } from "../../../piece/pieces";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "../position-specific-movement.rule";
import { Direction } from "../movement-rule";
import { Action } from "../../../affect/affect.types";
import { Coordinate } from "../../../coordinate";
import { MovementRules } from "../movement-rules.const";
import {
  buildMoveAffect,
  markAsUserSelected,
} from "../../../affect/affect.utils";
import { randomUUID } from "crypto";

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
      id: randomUUID(), // this
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

  const checkMoves = (moves: Action[], expectedMoves: Action[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toMatchActions(expectedMoves);
  };

  describe("check from the position for activation near border", () => {
    const fromX = 1;
    const fromY = 1;
    const from: Coordinate = [fromX, fromY];

    it("should return available moves 1-3 and 3-1", () => {
      updateRule({
        activatePositions: {
          y: new Set<number>([fromX]),
          x: new Set<number>([fromY]),
        },
      });
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [1, 3]))],
        [markAsUserSelected(buildMoveAffect(from, [3, 1]))],
      ];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return empty available moves when position is not for activation by x", () => {
      const expectedMoves: Action[] = [];

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
      const expectedMoves: Action[] = [];

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
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [fromX + speed, fromY]))],
      ];

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
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [fromX, fromY + speed]))],
      ];

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
      const from: Coordinate = [fromX, fromY];
      squares[fromY][fromX].putPiece(new Pawn(Color.white));

      updateRule({
        activatePositions: {
          x: new Set([2]),
          y: new Set([2]),
        },
      });
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [2, 0]))],
        [markAsUserSelected(buildMoveAffect(from, [0, 2]))],
        [markAsUserSelected(buildMoveAffect(from, [4, 2]))],
        [markAsUserSelected(buildMoveAffect(from, [2, 4]))],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return all diagonal moves", () => {
      const fromX = 2;
      const fromY = 2;
      const from: Coordinate = [fromX, fromY];
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
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [0, 0]))],
        [markAsUserSelected(buildMoveAffect(from, [0, 4]))],
        [markAsUserSelected(buildMoveAffect(from, [4, 0]))],
        [markAsUserSelected(buildMoveAffect(from, [4, 4]))],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });
});
