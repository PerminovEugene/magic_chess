import { Board } from "./board";
import { PieceType } from "./piece.consts";
import { Color } from "./color";
import { Coordinate } from "./coordinate";
import { reverseColor } from "./color";
import { MovesTree } from "./moves-tree";
import // coordToKey,
// parseToKey,
// serializeAffects,
// TurnChoosableData,
"./moves-tree.utils";
import { GlobalRule } from "./rules/global/check-mate.global-rule";
import { isAffectsEql } from "../utils/matchers";
import { Turn, TurnType } from "./turn";
import { BoardMeta } from "./board.types";
import { AffectType } from "./affect.types";
import { Action } from "./rules";
import { serializeCoordinate } from "./moves-tree.utils";

export class Player {
  constructor(public name: string) {}
}

export type NewPlayerGameData = {
  players: { [key in Color]: { name: string } };
  yourColor: Color;
  timeStart: string;
  timeForWhite: number;
  timeForBlack: number;
};

export class Game {
  private movesTree: MovesTree;

  constructor(
    public white: Player,
    public black: Player,
    public board: Board,
    public globalRules: GlobalRule[],
    public treeLength: number
  ) {
    this.nextTurnColor = Color.white;
    this.movesTree = new MovesTree(
      this.board,
      this.turns,
      this.globalRules,
      this.treeLength,
      this.nextTurnColor
    );
  }

  nextTurnColor: Color;
  turns: Turn[] = [];
  result: Color | "draw" | null = null;
  timeStart: string = new Date().toISOString();
  timeEnd: string | null = null;

  private updateGameNextTurn() {
    this.nextTurnColor = reverseColor(this.nextTurnColor);
  }

  // getMoveToCoordinatesObj(coordinate: Coordinate) {
  //   const root = this.movesTree.getRoot();
  //   return root.movements[serializeCoordinate(coordinate)];
  // }

  // getAvailableActionsForCoordinate(from: Coordinate) {
  //   const movements = this.getMoveToCoordinatesObj(from);
  //   if (!movements) {
  //     return;
  //   }
  //   const actions: Action[] = [];
  //   for (const toKey in movements) {
  //     actions.push(movements[toKey].affects));
  //   }
  //   return actions;
  // }

  // getMovementResult(
  //   affects: Action,
  // ) {
  //   const movements = this.getMoveToCoordinatesObj(from);
  //   if (!movements) {
  //     return;
  //   }
  //   return movements[coordToKey(to, selectedPieceType)];
  // }

  processTurn(turn: Turn) {
    const { color, type, affects, selectedPieceType } = turn;
    if (this.nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    if (type === TurnType.Move) {
      // this.board.validateTurn(turn, this.turns);

      // const root = this.movesTree.getRoot();

      // const from = turn.affects.find(
      //   (a) => a.type === AffectType.move && a.userSelected
      // )?.from;
      // const fromHash = coordToKey(from);
      // if (!root.movements[fromHash]) {
      //   throw new Error("Invalid from coordinate");
      // }

      // const moveRes = root.movements[fromHash][serializeAffects(affects)];
      // if (!moveRes) {
      //   throw new Error("Invalid to coordinate");
      // }
      // if (!isAffectsEql(moveRes.affects, turn.affects)) {
      //   throw new Error("Invalid move affects");
      // }

      this.movesTree.processTurn(turn);
      this.turns.push(turn);
    } else {
      // this.turns.push(turn);
      // this.board.cast(color, from, to);
    }

    this.updateGameNextTurn();
    const freshRoot = this.movesTree.getRoot();

    if (Object.keys(freshRoot.movements).length === 0) {
      if (freshRoot.underCheck) {
        this.result = reverseColor(color);
      } else {
        this.result = "draw";
      }
      this.timeEnd = new Date().toISOString();
    }
    return this.result;
  }

  // returns meta board for color, it hides opponent private data, hold minimal data
  getBoardMetaForColor(color: Color): BoardMeta {
    const boardMeta = this.board.getMeta();
    for (let i = 0; i < boardMeta.length; i++) {
      for (let j = 0; j < boardMeta[i].length; j++) {
        const meta = boardMeta[i][j];
        if (meta) {
          if (meta.color !== color) {
            // Rules will be hidden for  custom game mode, default mode reqires them for check-mate rule
            // meta.rules = []; // when scouting will be available need to add smarter solution
          }
        }
      }
    }
    return boardMeta;
  }

  getNewGameInfoForColor(color: Color): NewPlayerGameData {
    return {
      players: {
        [Color.white]: { name: this.white.name },
        [Color.black]: { name: this.black.name },
      },
      yourColor: color,
      timeStart: this.timeStart,
      timeForWhite: 10 * 60 * 1000, // 10 minutes for random game
      timeForBlack: 10 * 60 * 1000,
    };
  }
}
