import { PieceType } from "../../piece/piece.constants";
import { Color } from "../../color";
import { Board } from "../../board/board";
import { GameInitializer, Position } from "../../../../../src/game-initializer";
import { MovesTree } from "../moves-tree";
// import { printCells } from "../../../utils/board-printer";
import {
  CheckMateGlobalRule,
  GlobalRule,
} from "../../rules/global/check-mate.global-rule";
import * as fs from "fs";
import { buildMoveAffect, markAsUserSelected } from "../../affect/affect.utils";
import { Turn } from "../../turn";

/**
 * Writes a given object to a file as JSON using callback-based fs methods.
 *
 * @param {Object} data - The object to write as JSON.
 * @param {string} filePath - The path (including filename) where the JSON file should be created or overwritten.
 */
// function writeJsonToFileCallback(data: any, filePath: any) {
//   const jsonData = JSON.stringify(data, null, 2);
//   fs.writeFileSync(filePath, jsonData, "utf8");
// }

describe("MovesTree", () => {
  const gameInitializer = new GameInitializer();

  const setup = (
    board: Board,
    position: Position,
    globalRules: GlobalRule[] = [],
    initialColor: Color = Color.white
  ) => {
    // let board = new Board();
    gameInitializer.spawnDefaultRulesCustomPosition(board, position, false);

    return new MovesTree(board, [], globalRules, 3, initialColor);
  };

  describe("MovesTree", () => {
    /**
      |  |  |Kw|  |  |  |  
    --------------------
      |  |  |  |Pb|  |  |  
    --------------------
      |  |  |  |  |  |  |  
    --------------------
     */
    it("should return correct tree with three levels and in 1 case Pb doesn't have available moves (Kw to 4:0)", () => {
      const board = new Board();
      const tree = setup(board, {
        [Color.white]: [
          {
            type: PieceType.King,
            coordinate: [3, 0],
          },
        ],
        [Color.black]: [
          {
            type: PieceType.Pawn,
            coordinate: [4, 1],
          },
          {
            type: PieceType.King,
            coordinate: [5, 1],
          },
        ],
      });

      const root = tree.getRoot();

      const path = __dirname + "/test_case_1.json";
      // writeJsonToFileCallback(root, path); // USE FOR UPDATING IN CASE OF FORMAT CHANGE
      const data = fs.readFileSync(path, "utf8");
      const testCase1 = JSON.parse(data);
      expect(root).toEqual(testCase1);
    });

    it("should return correct tree with three levels and white king avoide suisidal movements", () => {
      const board = new Board();
      const tree = setup(
        board,
        {
          [Color.white]: [
            {
              type: PieceType.King,
              coordinate: [4, 0],
            },
          ],
          [Color.black]: [
            {
              type: PieceType.Pawn,
              coordinate: [4, 1],
            },
            {
              type: PieceType.King,
              coordinate: [7, 7],
            },
          ],
        },
        [new CheckMateGlobalRule()]
      );

      const root = tree.getRoot();

      const path = __dirname + "/test_case_2.json";
      // writeJsonToFileCallback(root, path); //USE FOR UPDATING IN CASE OF FORMAT CHANGE
      const data = fs.readFileSync(path, "utf8");
      const testCase1 = JSON.parse(data);

      expect(root).toEqual(testCase1);
    });

    /*
      |  |  |  |Kw|  |  |  
    -----------------------
    rb|  |  |Rb|  |Rb|  |  
    -----------------------
      |  |  |  |  |  |  |  
    -----------------------
      |  |  |  |  |  |  |  
    -----------------------
      |  |  |  |  |  |  |  
    -----------------------
      |  |  |  |  |  |  |  
    -----------------------
      |  |  |  |  |  |  |  
    -----------------------
      |  |  |  |  |  |  |Kb
    */
    it("should return correct tree with stalemate because white king does not have moves and not udner check", () => {
      const board = new Board();
      const position: Position = {
        [Color.white]: [
          {
            type: PieceType.King,
            coordinate: [4, 0],
          },
        ],
        [Color.black]: [
          {
            type: PieceType.Rook,
            coordinate: [5, 1],
          },
          {
            type: PieceType.Rook,
            coordinate: [0, 1],
          },
          {
            type: PieceType.King,
            coordinate: [7, 7],
          },
        ],
      };

      const tree = setup(
        board,
        position,
        [new CheckMateGlobalRule()],
        Color.black
      );

      // const path = __dirname + "/1.json";
      // writeJsonToFileCallback(tree.getRoot(), path); //USE FOR UPDATING IN CASE OF FORMAT CHANGE

      tree.processTurn({
        affects: [markAsUserSelected(buildMoveAffect([0, 1], [3, 1]))],
      } as Turn);

      const root = tree.getRoot();

      expect(root).toEqual({
        color: "white",
        movements: {},
      });
    });

    it("should return correct tree with checkmate because white king does not have moves and under check", () => {
      const board = new Board();
      const tree = setup(
        board,
        {
          [Color.white]: [
            {
              type: PieceType.King,
              coordinate: [4, 0],
            },
          ],
          [Color.black]: [
            {
              type: PieceType.Rook,
              coordinate: [1, 1],
            },
            {
              type: PieceType.Rook,
              coordinate: [0, 1],
            },
            {
              type: PieceType.King,
              coordinate: [7, 7],
            },
          ],
        },
        [new CheckMateGlobalRule()],
        Color.white
      );

      tree.processTurn({
        affects: [markAsUserSelected(buildMoveAffect([4, 0], [3, 0]))],
      } as Turn);

      // printCells(board.getMeta());

      tree.processTurn({
        affects: [markAsUserSelected(buildMoveAffect([0, 1], [0, 0]))],
      } as Turn);

      // printCells(board.getMeta());

      const root = tree.getRoot();

      expect(root).toEqual({
        color: "white",
        movements: {},
        underCheck: true,
      });
    });

    it("should check that moves tree is under 65MB ", () => {
      const before = process.memoryUsage().heapUsed;

      const path = __dirname + "/full_tree_on_default_setup.json";

      // Load and parse JSON
      // const board = new Board();
      // const tree = setup(
      //   board,
      //   gameInitializer.spawnDefaultRulesAndDefaultPosition(board),
      //   [new CheckMateGlobalRule()]
      // );
      // const root = tree.getRoot();
      // writeJsonToFileCallback(root, path);

      const data = JSON.parse(fs.readFileSync(path, "utf8"));

      const after = process.memoryUsage().heapUsed;

      const sizeMb = (after - before) / 1024 / 1024;

      expect(data).toBeDefined();
      expect(sizeMb).toBeLessThan(65);
    });
  });
});
