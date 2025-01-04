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
import { Timer } from "./timer";

export class Player {
  constructor(public name: string) {}
}

export type NewPlayerGameData = {
  players: { [key in Color]: { name: string } };
  yourColor: Color;
  timeStart: string;
  timeLeft: { [key in Color]: number };
};

export class Game {
  private movesTree: MovesTree;
  private timers: { [key in Color]: Timer };

  private _nextTurnColor: Color;
  private turns: Turn[] = [];
  result: Color | "draw" | null = null;
  public timeStart: string = new Date().toISOString();
  public timeEnd: string | null = null;

  constructor(
    public white: Player,
    public black: Player,
    public board: Board,
    public globalRules: GlobalRule[],
    public treeLength: number,
    private timeLeft: { [key in Color]: number }
  ) {
    this._nextTurnColor = Color.white;
    this.movesTree = new MovesTree(
      this.board,
      this.turns,
      this.globalRules,
      this.treeLength,
      this._nextTurnColor
    );

    this.timers = {
      [Color.white]: new Timer(this.timeLeft[Color.white], () =>
        this.onTimeEnd(Color.white)
      ),
      [Color.black]: new Timer(this.timeLeft[Color.black], () =>
        this.onTimeEnd(Color.black)
      ),
    };
  }

  public get nextTurnColor() {
    return this._nextTurnColor;
  }

  private updateGameNextTurn() {
    this._nextTurnColor = reverseColor(this._nextTurnColor);
  }

  private onTimeEnd = (color: Color) => {
    this.result = reverseColor(color);
    this.timeEnd = new Date().toISOString();
    this.externalOnTimeEnd();
  };

  private externalOnTimeEnd: () => void = () => {};

  startTimer(externalOnTimeEnd: () => void) {
    this.timeStart = new Date().toISOString();
    this.timers[Color.white].start();
    this.externalOnTimeEnd = externalOnTimeEnd;
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
    if (this._nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    if (type === TurnType.Move) {
      this.timers[color].pause();
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
    } else {
      this.timers[reverseColor(color)].start();
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
      timeLeft: this.timeLeft,
    };
  }
}
