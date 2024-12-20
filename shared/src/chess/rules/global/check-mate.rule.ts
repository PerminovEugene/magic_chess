import { Board } from "../../board";
import { Cell } from "../../cell";
import { reverseColor } from "../../color";
import { Coordinate, isCoordinateEql } from "../../coordinate";
import { Turn } from "../../game";
import { Color, PieceType } from "../../piece";
import { AvailableMove } from "..";
import { MovesTree, parseKey } from "./moves-tree";
import { Node } from "./moves-tree.types";

export class CheckMateGlobalRule {
  private underAttack: { [key in Color]: Coordinate[] } = {
    [Color.white]: [],
    [Color.black]: [],
  };
  // will be used for imitate nextTurn and not recreate arrays
  private squares: Cell[][] = [];

  constructor(private board: Board) {
    this.squares = board.buildCells();
  }

  private mainPieceType = PieceType.King;

  isUnderAttack(color: Color) {
    return this.underAttack[color].length > 0;
  }

  // call it before new turn application.
  // It checks will it provoke self check, which is invalid in default chess ruls
  // it creates board position after new Turn and search for opposite color piece which
  // can attack new Turns color king
  public getMoveGlobalAffects(
    newTurn: Turn,
    node: Node,
    // turns: Turn[],
    cells: Cell[][] // in new Turn position
  ) {
    // yes quite donkey implementation, but will be refactored later
    // it's possible to check distance before calc all moves

    const {
      color,
      from: [fromX, fromY],
      to: [toX, toY],
      affects,
    } = newTurn;

    // check is king under attack
    const kingCoordinate = this.board.findUniqPiece(
      cells,
      color,
      this.mainPieceType
    );
    // console.log("king under attack check", kingCoordinate);
    // const nextTurns = [...turns, newTurn];

    let currentColor = node.color;

    let allMovesLeadToMate = true;
    for (const movementFrom in node.movements) {
      const from = parseKey(movementFrom);
      for (const movementTo in node.movements[movementFrom]) {
        const to = parseKey(movementTo);

        const moveResultData = node.movements[movementFrom][movementTo];

        const nextNode = moveResultData.next;
        let leadsToCheck = false;
        for (const nextMovementFrom in nextNode.movements) {
          // const [nextFromX, nextFromY] = parseKey(movementFrom);
          for (const nextMovementTo in nextNode.movements[nextMovementFrom]) {
            const nextTo = parseKey(nextMovementTo);

            // if king made a move we need to use its new position
            const actualCurrentKingCoordinate = isCoordinateEql(
              kingCoordinate,
              from
            )
              ? from
              : to;
            // TODO add checking kill affects later
            if (isCoordinateEql(actualCurrentKingCoordinate, nextTo)) {
              nextNode.movements[nextMovementFrom][
                nextMovementTo
              ].next.underCheck = true;
              leadsToCheck = true;
            }
          }
        }
        if (!leadsToCheck) {
          // at least one currentColor move doesn't lead to immediate check
          allMovesLeadToMate = false;
        }
      }
    }
    if (allMovesLeadToMate) {
      if (node.underCheck) {
        node.winner = reverseColor(currentColor);
      } else {
        node.staleMate = true;
      }
    }
  }

  // call it before new turn application.
  // It checks will it provoke self check, which is invalid in default chess ruls
  // it creates board position after new Turn and search for opposite color piece which
  // can attack new Turns color king
  public doesMoveProvokeCheck(
    newTurn: Turn,
    turns: Turn[],
    squares?: Cell[][]
  ): boolean {
    // yes quite donkey implementation, but will be refactored later
    // it's possible to check distance before calc all moves

    const {
      color,
      from: [fromX, fromY],
      to: [toX, toY],
      affects,
    } = newTurn;

    const cells = squares
      ? squares
      : this.board.duplicatePosition(this.squares);

    // imitate next move
    const fromCell = cells[fromY][fromX];
    const toCell = cells[toY][toX];
    this.board.updateCellsOnMove(cells, fromCell, toCell, affects);

    // check is king under attack
    const kingCoordinate = this.board.findUniqPiece(
      cells,
      color,
      this.mainPieceType
    );
    // console.log("king under attack checl ", kingCoordinate);
    const nextTurns = [...turns, newTurn];
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        const cell = cells[y][x];
        const piece = cell.getPiece();
        if (piece && piece.color !== color) {
          // console.log("checking: ", piece.type, piece.color, x, y);

          const rules = piece?.movementRules;
          for (const rule of rules) {
            // console.log("rule: ", rule);

            const availableMoves = rule.availableMoves(x, y, cells, nextTurns);
            // for (const move of availableMoves) {
            //   console.log(
            //     "checking from ",
            //     move,
            //     move[0] === king[0] && move[1] === king[1]
            //   );
            //   if (move[0] === king[0] && move[1] === king[1]) {
            //     console.log("check", move, king);
            //     console.log("provoked by rule", rule);
            //     console.log("provoked by piece", piece);
            //     return true;
            //   }
            // }
            if (
              availableMoves.find((move) => {
                return isCoordinateEql(kingCoordinate, move as Coordinate);
              })
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // need to imitate all possible moves for all pieces of color
  // and check will king still be under check
  // checkForMate(color: Color) {
  //   for (let y = 0; y < this.squares.length; y++) {
  //     for (let x = 0; x < this.squares[y].length; x++) {
  //       this.selectedPiece = this.squares[y][x];
  //     }
  //   }
  //     this.selectedPiece = [x, y];
  //     this.state = GameStateName.PieceSelected;

  //     const pieceRules = selectedPiece.movementRules;
  //     pieceRules?.forEach((rule) => {
  //       const ruleMoves = rule.availableMoves(
  //         x,
  //         y,
  //         this.board!.squares,
  //         this.game?.turns as Turn[]
  //       );

  //       ruleMoves.forEach((move) => {
  //         console.log("Move for piece", this.gameInfo.yourColor, [x, y]);
  //         const check = this.checkMateGlobalRule.doesMoveProvokeCheck(
  //           {
  //             color: this.gameInfo.yourColor,
  //             from: [x, y],
  //             to: [move[0], move[1]],
  //             affects: move[2],
  //             type: TurnType.Move,
  //             pieceType: selectedPiece.type,
  //             timestamp: new Date().toISOString(),
  //             check: false,
  //           } as any,
  //           this.game?.turns
  //         );
  //         if (check) {
  //           // console.log("--rule found moves-->", x, y, ruleMoves);
  //           // console.log(
  //           //   "--->",
  //           //   this.gameInfo.yourColor,
  //           //   [x, y],
  //           //   [move[0], move[1]],
  //           //   move[2]
  //           // );
  //           console.log("excluded move because of check", move);
  //         } else {
  //           console.log("Move possible", [x, y], [move[0], move[1]]);
  //           this.availableMoves.push(move);
  //         }
  //       });
  //     });
  //     // console.log(pieceRules);

  //     this.sceneUpdatesEventEmitter.dispatchEvent(
  //       new CustomEvent(StateMachineEvents.showAvailableMoves, {
  //         detail: {
  //           availableMoves: this.availableMoves,
  //           x,
  //           y,
  //         },
  //       })
  //     );
  //   } else {
  //   }
  // }

  updateCheckStatus(nextPlayerColor: Color, turns: Turn[]) {
    this.board.duplicatePosition(this.squares);
    this.board;
    const kingCoordinate = this.board.findUniqPiece(
      this.squares,
      nextPlayerColor,
      this.mainPieceType
    );

    const lastTurnPlayerColor = reverseColor(nextPlayerColor);
    let piecesCoordinatesWhichProvokesCheck: Coordinate[] = [];
    this.squares.forEach((row, y) => {
      row.forEach((cell, x) => {
        const piece = cell.getPiece();
        if (piece && piece.color === lastTurnPlayerColor) {
          piece.movementRules.forEach((rule) => {
            // TODO moves for each piece should be calculated once and stored untill next turn
            const moves = rule.availableMoves(x, y, this.squares, turns);

            if (
              moves.find((move) => {
                return isCoordinateEql(kingCoordinate, move as Coordinate);
              })
            ) {
              piecesCoordinatesWhichProvokesCheck.push([x, y]);
            }
          });
        }
      });
    });

    if (piecesCoordinatesWhichProvokesCheck.length > 0) {
      this.underAttack[nextPlayerColor] = piecesCoordinatesWhichProvokesCheck;
      this.underAttack[lastTurnPlayerColor] = [];
    }
  }

  // call it after new turn application to check is this turn creates check
  isCheck(color: Color) {
    return this.underAttack[Color[color]]?.length > 0;
  }

  // call it after new turn application to check is this turn creates mate
  isCheckMate(color: Color) {
    return this.underAttack[Color[color]]?.length > 0; // TODO
  }
}
