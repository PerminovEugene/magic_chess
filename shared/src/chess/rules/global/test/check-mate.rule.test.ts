// import { Cell } from "../../../cell";
// import { Color, PieceType } from "../../../piece";
// import { Turn, TurnType } from "../../../game";
// import { Board } from "../../../board";
// import {
//   GameInitializer,
//   Position,
// } from "../../../../../../src/game-initializer";
// import { CheckMateGlobalRule2 } from "../check-mate.global-rule";

// describe("CheckMateGlobalRule", () => {
//   const gameInitializer = new GameInitializer();

//   const setupBoardAndRule = (position: Position) => {
//     let board = new Board();
//     board.buildCells();
//     gameInitializer.spawnDefaultRulesCustomPosition(board, position);
//     return new CheckMateGlobalRule2(board);
//   };

//   describe("doesMoveProvokeCheck", () => {
//     it("should return true when white king is under attack", () => {
//       const rule = setupBoardAndRule({
//         [Color.white]: [
//           {
//             type: PieceType.King,
//             coordinate: [3, 0],
//           },
//         ],
//         [Color.black]: [
//           {
//             type: PieceType.Rook,
//             coordinate: [4, 1],
//           },
//         ],
//       });

//       const turn = {
//         from: [3, 0],
//         to: [4, 0],
//         color: Color.white,
//         type: TurnType.Move,
//         pieceType: PieceType.King,
//         timestamp: new Date().toISOString(),
//         check: false,
//       } as Turn;

//       const check = rule.doesMoveProvokeCheck(turn, []);

//       expect(check).toBeTruthy();
//     });

//     it("should return false when white king is safe", () => {
//       const rule = setupBoardAndRule({
//         [Color.white]: [
//           {
//             type: PieceType.King,
//             coordinate: [3, 0],
//           },
//         ],
//         [Color.black]: [
//           {
//             type: PieceType.Rook,
//             coordinate: [4, 1],
//           },
//         ],
//       });

//       const turn = {
//         from: [3, 0],
//         to: [2, 0],
//         color: Color.white,
//         type: TurnType.Move,
//         pieceType: PieceType.King,
//         timestamp: new Date().toISOString(),
//         check: false,
//       } as Turn;

//       const check = rule.doesMoveProvokeCheck(turn, []);

//       expect(check).toBeFalsy();
//     });

//     it("should return true when white king will be under attack", () => {
//       const position = {
//         [Color.white]: [
//           { type: "Rook", coordinate: [0, 0] },
//           { type: "Knight", coordinate: [1, 0] },
//           { type: "Bishop", coordinate: [2, 0] },
//           { type: "King", coordinate: [3, 0] },
//           { type: "Bishop", coordinate: [5, 0] },
//           { type: "Knight", coordinate: [6, 0] },
//           { type: "Rook", coordinate: [7, 0] },
//           { type: "Pawn", coordinate: [3, 1] },
//           { type: "Queen", coordinate: [4, 1] },
//         ],
//         [Color.black]: [
//           { type: "Queen", coordinate: [7, 4] },
//           { type: "Pawn", coordinate: [3, 6] },
//           { type: "Rook", coordinate: [0, 7] },
//           { type: "Knight", coordinate: [1, 7] },
//           { type: "Bishop", coordinate: [2, 7] },
//           { type: "King", coordinate: [3, 7] },
//           { type: "Bishop", coordinate: [5, 7] },
//           { type: "Knight", coordinate: [6, 7] },
//           { type: "Rook", coordinate: [7, 7] },
//         ],
//       } as Position;

//       const rule = setupBoardAndRule(position);

//       const turn = {
//         from: [4, 1],
//         to: [4, 2],
//         color: Color.white,
//         type: TurnType.Move,
//         pieceType: PieceType.Queen,
//         timestamp: new Date().toISOString(),
//         check: false,
//       } as Turn;

//       const check = rule.doesMoveProvokeCheck(turn, []);

//       expect(check).toBeTruthy();
//     });
//   });

//   describe("updateCheckStatus", () => {
//     it("should return true when white king is under attack", () => {
//       const rule = setupBoardAndRule({
//         [Color.white]: [
//           {
//             type: PieceType.King,
//             coordinate: [4, 0],
//           },
//         ],
//         [Color.black]: [
//           {
//             type: PieceType.Rook,
//             coordinate: [4, 1],
//           },
//         ],
//       });

//       rule.updateCheckStatus(Color.white, []);

//       expect(rule.isCheck(Color.white)).toBeTruthy();
//     });

//     it("should return true when white king is under attack", () => {
//       const rule = setupBoardAndRule({
//         [Color.white]: [
//           {
//             type: PieceType.King,
//             coordinate: [4, 0],
//           },
//         ],
//         [Color.black]: [
//           {
//             type: PieceType.Rook,
//             coordinate: [3, 1],
//           },
//         ],
//       });

//       rule.updateCheckStatus(Color.white, []);

//       expect(rule.isCheck(Color.white)).toBeFalsy();
//     });
//   });
// });
