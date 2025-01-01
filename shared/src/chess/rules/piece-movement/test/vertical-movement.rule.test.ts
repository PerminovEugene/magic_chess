import { randomUUID } from "crypto";
import { AffectType } from "../../../affect/affect.types";
import {
  buildKillAffect,
  buildMoveAffect,
  markAsUserSelected,
} from "../../../affect/affect.utils";
import { Cell } from "../../../cell";
import { Color } from "../../../color";
import { Coordinate } from "../../../coordinate";
import { Pawn } from "../../../piece/pieces";
import { Action, Direction } from "../movement-rule";
import { MovementRules } from "../movement-rules.const";
import { StraightMovementRuleConfig } from "../straight-movement.rule";
import { VerticalMovementRule } from "../vertical-movement.rule";

describe("VerticalMovementRule", () => {
  let rule: VerticalMovementRule;
  let squares: Cell[][];
  const size = 5;
  const getPiece = (x: number, y: number) => {
    return squares[y][x].getPiece();
  };

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
      id: randomUUID(),
      name: MovementRules.VerticalMovementRule,
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

  const checkMoves = (moves: Action[], expectedMoves: Action[]) => {
    expect(moves).toHaveLength(expectedMoves.length);
    expect(moves).toMatchActions(expectedMoves);
  };

  describe("check from the middle", () => {
    const fromX = 2;
    const fromY = 2;
    const from = [fromX, fromY] as Coordinate;

    describe("check from the middle", () => {
      const fromX = 2;
      const fromY = 2;
      const from = [fromX, fromY] as Coordinate;

      it("should return available moves for upward direction", () => {
        updateRule({ directions: new Set<Direction>([Direction.Up]) });
        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect(from, [2, 0]))],
          [markAsUserSelected(buildMoveAffect(from, [2, 1]))],
        ];
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return available moves for downward direction", () => {
        updateRule({ directions: new Set<Direction>([Direction.Down]) });
        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect(from, [2, 3]))],
          [markAsUserSelected(buildMoveAffect(from, [2, 4]))],
        ];
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return available moves for upward and downward directions", () => {
        updateRule({
          directions: new Set<Direction>([Direction.Up, Direction.Down]),
        });
        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect(from, [2, 0]))],
          [markAsUserSelected(buildMoveAffect(from, [2, 1]))],
          [markAsUserSelected(buildMoveAffect(from, [2, 3]))],
          [markAsUserSelected(buildMoveAffect(from, [2, 4]))],
        ];
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });
    });

    describe("check close to the edge", () => {
      it("should return available moves for upward direction", () => {
        const fromX = 2;
        const fromY = 1;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({ directions: new Set<Direction>([Direction.Up]) });
        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 0]))],
        ];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return available moves for downward direction", () => {
        const fromX = 2;
        const fromY = 3;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({ directions: new Set<Direction>([Direction.Down]) });
        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 4]))],
        ];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });
    });

    describe("check at the edge", () => {
      it("should return no available moves for upward direction", () => {
        const fromX = 2;
        const fromY = 0;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({ directions: new Set<Direction>([Direction.Up]) });
        const expectedMoves: Action[] = [];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return no available moves for downward direction", () => {
        const fromX = 2;
        const fromY = 4;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({ directions: new Set<Direction>([Direction.Down]) });
        const expectedMoves: Action[] = [];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });
    });

    describe("check near other pieces", () => {
      it("should return available moves when allied pieces are close", () => {
        const fromX = 2;
        const fromY = 2;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({
          directions: new Set<Direction>([Direction.Down, Direction.Up]),
        });
        squares[0][2].putPiece(new Pawn(Color.white));
        squares[3][2].putPiece(new Pawn(Color.white));

        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 1]))],
        ];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return available moves when enemy pieces are close and can be killed", () => {
        const fromX = 2;
        const fromY = 2;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({
          directions: new Set<Direction>([Direction.Down, Direction.Up]),
        });
        squares[0][2].putPiece(new Pawn(Color.black));
        squares[3][2].putPiece(new Pawn(Color.black));

        const expectedMoves: Action[] = [
          [
            buildKillAffect([2, 0]),
            markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 0])),
          ],
          [markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 1]))],
          [
            buildKillAffect([2, 3]),
            markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 3])),
          ],
        ];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });

      it("should return available moves when enemy pieces are close and cannot be killed", () => {
        const fromX = 2;
        const fromY = 2;
        squares[fromY][fromX].putPiece(new Pawn(Color.white));

        updateRule({
          moveToKill: false,
          directions: new Set<Direction>([Direction.Down, Direction.Up]),
        });
        squares[0][2].putPiece(new Pawn(Color.black));
        squares[3][2].putPiece(new Pawn(Color.black));

        const expectedMoves: Action[] = [
          [markAsUserSelected(buildMoveAffect([fromX, fromY], [2, 1]))],
        ];

        const moves = rule.availableMoves(fromX, fromY, getPiece, [], size);

        checkMoves(moves, expectedMoves);
      });
    });
  });
});
