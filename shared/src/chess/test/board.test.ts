import { Coordinate } from "../coordinate";
import { Board } from "../board/board";
import { GameInitializer, Position } from "../../../../src/game-initializer";
import { Color } from "../color";
import { PieceType } from "../piece/piece.constants";
import {
  buildKillAffect,
  buildMoveAffect,
  buildTransformationAffect,
  markAsUserSelected,
} from "../affect/affect.utils";
import { Piece } from "../piece";

describe("Board", () => {
  let board: Board;
  const gameInitializer = new GameInitializer();

  const setup = (position: Position) => {
    board = new Board();
    gameInitializer.spawnDefaultRulesCustomPosition(board, position, true);
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

    it("should revert board to the source position correctly", () => {
      setup(position);

      const kingMoves = board.getPieceAvailableMoves(3, 0, []);
      const killPawnMove = kingMoves.find((move) => move.length === 2);
      if (!killPawnMove) {
        fail("Kill pawn move not found");
      }
      board.updateCellsOnMove(killPawnMove);
      board.revertMove(killPawnMove);

      const whiteKingAfterRevert = board.getPieceByCoordinate(whiteKingPos);
      expect(whiteKingAfterRevert).toBeDefined();
      expect(whiteKingAfterRevert!.type).toEqual(PieceType.King);

      const blackPawnAfterRevert = board.getPieceByCoordinate(blackPawnPos);
      expect(blackPawnAfterRevert).toBeDefined();
      expect(blackPawnAfterRevert!.type).toEqual(PieceType.Pawn);
      expect(blackPawnAfterRevert!.color).toEqual(Color.black);
    });
  });

  describe("In pawn makes move, kill bishop and transforms to queen position", () => {
    const whiteKingPos: Coordinate = [0, 0];
    const blackKingPos: Coordinate = [7, 7];

    const blackPawnPos: Coordinate = [6, 1];
    const whiteBishopPos: Coordinate = [5, 0];

    const position: Position = {
      [Color.white]: [
        {
          type: PieceType.King,
          coordinate: whiteKingPos,
        },
        {
          type: PieceType.Bishop,
          coordinate: whiteBishopPos,
        },
      ],
      [Color.black]: [
        {
          type: PieceType.Pawn,
          coordinate: blackPawnPos,
        },
        {
          type: PieceType.King,
          coordinate: blackKingPos,
        },
      ],
    };
    const buildActionToEmptyCell = (pieceType: PieceType) => {
      return [
        markAsUserSelected(buildMoveAffect(blackPawnPos, [6, 0])),
        markAsUserSelected(
          buildTransformationAffect([6, 0], pieceType, PieceType.Pawn)
        ),
      ];
    };

    const buildActionToCellWithBishop = (pieceType: PieceType) => {
      return [
        buildKillAffect(whiteBishopPos),
        markAsUserSelected(buildMoveAffect(blackPawnPos, whiteBishopPos)),
        markAsUserSelected(
          buildTransformationAffect(whiteBishopPos, pieceType, PieceType.Pawn)
        ),
      ];
    };

    it("Should return valid move affects for pawn", () => {
      setup(position);

      const pawnMoves = board.getPieceAvailableMoves(
        blackPawnPos[0],
        blackPawnPos[1],
        []
      );

      expect(pawnMoves).isEqlAvailableMoves([
        buildActionToCellWithBishop(PieceType.Queen),
        buildActionToCellWithBishop(PieceType.Bishop),
        buildActionToCellWithBishop(PieceType.Knight),
        buildActionToCellWithBishop(PieceType.Rook),
        buildActionToEmptyCell(PieceType.Queen),
        buildActionToEmptyCell(PieceType.Bishop),
        buildActionToEmptyCell(PieceType.Knight),
        buildActionToEmptyCell(PieceType.Rook),
      ]);
    });

    it("Should handle affects correctly and update board squares", () => {
      setup(position);

      const killBishopMove = buildActionToCellWithBishop(PieceType.Queen);

      if (!killBishopMove) {
        fail("Kill pawn move not found");
      }
      board.updateCellsOnMove(killBishopMove);

      expect(board.getPieceByCoordinate(whiteKingPos)).toBeDefined();
      expect(board.getPieceByCoordinate(blackPawnPos)).toBeUndefined();
      expect(board.getPieceByCoordinate(whiteBishopPos)).toBeDefined();
      expect(board.getPieceByCoordinate(whiteBishopPos)?.type).toEqual(
        PieceType.Queen
      );
      expect(board.getPieceByCoordinate(whiteBishopPos)?.color).toEqual(
        Color.black
      );
    });

    it("should revert board to the source position correctly", () => {
      setup(position);

      const killBishopMove = buildActionToCellWithBishop(PieceType.Queen);

      if (!killBishopMove) {
        fail("Kill pawn move not found");
      }
      board.updateCellsOnMove(killBishopMove);
      board.revertMove(killBishopMove);

      expect(board.getPieceByCoordinate(blackPawnPos)).toBeDefined();
      expect(board.getPieceByCoordinate(whiteBishopPos)).toBeDefined();

      expect(board.getPieceByCoordinate(whiteBishopPos)?.type).toEqual(
        PieceType.Bishop
      );
      expect(board.getPieceByCoordinate(whiteBishopPos)?.color).toEqual(
        Color.white
      );

      expect(board.getPieceByCoordinate(blackPawnPos)?.type).toEqual(
        PieceType.Pawn
      );
      expect(board.getPieceByCoordinate(blackPawnPos)?.color).toEqual(
        Color.black
      );
    });
  });
});
