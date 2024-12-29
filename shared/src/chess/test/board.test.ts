import { fromChessToLogic, fromLogicArrayToChess } from "../turn-formatter";
import { Coordinate } from "../coordinate";
import { Board } from "../board";
import { GameInitializer, Position } from "../../../../src/game-initializer";
import { Color } from "../color";
import { PieceType } from "../piece.consts";
import {
  buildKillAffect,
  buildMoveAffect,
  markAsUserSelected,
} from "../affect.utils";

describe("Board", () => {
  let board: Board;
  const gameInitializer = new GameInitializer();

  const setup = (position: Position) => {
    board = new Board();
    gameInitializer.spawnDefaultRulesCustomPosition(board, position, false);
  };

  describe("In king kills pawn position", () => {
    const blackPawnPos: Coordinate = [2, 0];
    const whiteKingPos: Coordinate = [3, 0];
    const position: Position = {
      [Color.black]: [
        {
          type: PieceType.King,
          coordinate: [0, 0],
        },
        {
          type: PieceType.Pawn,
          coordinate: blackPawnPos,
        },
      ],
      [Color.white]: [
        {
          type: PieceType.King,
          coordinate: whiteKingPos,
        },
      ],
    };
    it("Should return valid move affects for king", () => {
      setup(position);

      const kingMoves = board.getPieceAvailableMoves(3, 0, []);

      expect(kingMoves).isEqlAvailableMoves([
        [
          buildKillAffect([2, 0]),
          markAsUserSelected(buildMoveAffect(whiteKingPos, blackPawnPos)),
        ],
        [markAsUserSelected(buildMoveAffect(whiteKingPos, [3, 1]))],
        [markAsUserSelected(buildMoveAffect(whiteKingPos, [4, 0]))],
        [markAsUserSelected(buildMoveAffect(whiteKingPos, [4, 1]))],
        [markAsUserSelected(buildMoveAffect(whiteKingPos, [2, 1]))],
      ]);
    });

    it("Should handle affects correctly and update board squares", () => {
      setup(position);

      const kingMoves = board.getPieceAvailableMoves(3, 0, []);
      const killPawnMove = kingMoves.find((move) => move.length === 2);
      if (!killPawnMove) {
        fail("Kill pawn move not found");
      }
      board.updateCellsOnMove(killPawnMove);

      expect(board.getPieceByCoordinate(whiteKingPos)).toBeUndefined();
      expect(board.getPieceByCoordinate(blackPawnPos)).toBeDefined();
      expect(board.getPieceByCoordinate(blackPawnPos)?.type).toEqual(
        PieceType.King
      );
    });
  });
});
