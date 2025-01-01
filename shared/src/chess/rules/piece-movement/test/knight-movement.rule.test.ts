import { Cell } from "../../../cell";
import { Color } from "../../../color";
import { Pawn, Knight } from "../../../piece/pieces";
import { Coordinate } from "../../../coordinate";
import { KnightMovementRule } from "../knight-movement.rule";
import { Action, Direction } from "../movement-rule";
import { StraightMovementRuleConfig } from "../straight-movement.rule";
import { MovementRules } from "../movement-rules.const";
import {
  buildKillAffect,
  buildMoveAffect,
  markAsUserSelected,
} from "../../../affect/affect.utils";
import { randomUUID } from "crypto";

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
      id: randomUUID(), // this
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

  const checkMoves = (moves: Action[], expectedMoves: Action[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toMatchActions(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;
    const from: Coordinate = [fromX, fromY]; // used in buildMoveAffect

    it("should return available moves", () => {
      updateRule();
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [1, 0]))],
        [markAsUserSelected(buildMoveAffect(from, [3, 0]))],
        [markAsUserSelected(buildMoveAffect(from, [0, 1]))],
        [markAsUserSelected(buildMoveAffect(from, [4, 1]))],
        [markAsUserSelected(buildMoveAffect(from, [0, 3]))],
        [markAsUserSelected(buildMoveAffect(from, [4, 3]))],
        [markAsUserSelected(buildMoveAffect(from, [1, 4]))],
        [markAsUserSelected(buildMoveAffect(from, [3, 4]))],
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
      const from: Coordinate = [fromX, fromY];

      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();
      const expectedMoves: Action[] = [
        [markAsUserSelected(buildMoveAffect(from, [2, 1]))],
        [markAsUserSelected(buildMoveAffect(from, [1, 2]))],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });

  describe("check near other pieces", () => {
    it("should return available moves when alied pieces are close", () => {
      const fromX = 0;
      const fromY = 0;
      const from: Coordinate = [fromX, fromY];

      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();

      squares[2][1].putPiece(new Pawn(Color.white));
      squares[1][2].putPiece(new Pawn(Color.white));

      const expectedMoves: Action[] = [];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });

    it("should return available moves when enemy pieces are close and can moveToKill", () => {
      const fromX = 0;
      const fromY = 0;
      const from: Coordinate = [fromX, fromY];

      squares[fromY][fromX].putPiece(new Knight(Color.white));

      updateRule();

      squares[2][1].putPiece(new Pawn(Color.black));
      squares[1][2].putPiece(new Pawn(Color.black));

      const expectedMoves: Action[] = [
        [
          buildKillAffect([2, 1]),
          markAsUserSelected(buildMoveAffect(from, [2, 1])),
        ],
        [
          buildKillAffect([1, 2]),
          markAsUserSelected(buildMoveAffect(from, [1, 2])),
        ],
      ];

      const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

      checkMoves(moves, expectedMoves);
    });
  });
});
