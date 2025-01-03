import { Board } from "./board/board";
import { Color } from "./color";
import { reverseColor } from "./color";
import { MovesTree } from "./moves-tree/moves-tree";
import { GlobalRule } from "./rules/global/check-mate.global-rule";
import { Turn, TurnType } from "./turn";
import { BoardMeta } from "./board/board.types";
import { Coordinate } from "./coordinate";
import { serializeCoordinate } from "./moves-tree";
import { Action } from "./affect/affect.types";

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

  getActionsForCoordinate(coordinate: Coordinate): Action[] {
    const root = this.movesTree.getRoot();
    const actions: Action[] = [];
    const fromKey = serializeCoordinate(coordinate);
    const movements = root.movements[fromKey];
    if (!movements) {
      return actions;
    }
    for (const toKey in movements) {
      actions.push(movements[toKey].affects);
    }

    return actions;
  }

  processTurn(turn: Turn) {
    const { color, type } = turn;
    if (this.nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    if (type === TurnType.Move) {
      this.turns.push(turn);
      this.movesTree.processTurn(turn);
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
  getBoardMeta(): BoardMeta {
    return this.board.getMeta();
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
