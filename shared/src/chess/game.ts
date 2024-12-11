import { Board } from "./board";
import { Color, PieceMeta, PieceType } from "./piece";
import { Affect } from "./rules";
import { Coordinate } from "./types";

export class Player {
  constructor(public name: string) {}
}

export enum TurnType {
  Move = "move",
  Skill = "skill",
}

export type BoardMeta = PieceMeta[][];

export type NewPlayerGameData = {
  players: { [key in Color]: { name: string } };
  yourColor: Color;
  timeStart: string;
  timeForWhite: number;
  timeForBlack: number;
};

export type Turn = {
  color: Color;
  type: TurnType;
  pieceType: PieceType;
  from: Coordinate;
  to: Coordinate;
  affects?: Affect[];
  timestamp: string;
};

export class Game {
  constructor(public white: Player, public black: Player, public board: Board) {
    this.nextTurnColor = Color.white;
  }
  nextTurnColor: Color;
  turns: Turn[] = [];
  result: Color | "draw" | null = null;
  timeStart: string = new Date().toISOString();
  timeEnd: string | null = null;

  private updateGameNextTurn() {
    this.nextTurnColor =
      this.nextTurnColor === Color.black ? Color.white : Color.black;
  }

  processTurn(turn: Turn) {
    const { color, from, to, type, timestamp, affects } = turn;
    if (this.nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    if (type === TurnType.Move) {
      this.board.move(color, from, to, this.turns, affects);
    } else {
      this.board.cast(color, from, to);
    }
    this.turns.push(turn);
    this.updateGameNextTurn();
    // todo check win condition and return true in that case
    return false;
  }

  // returns meta board for color, it hides opponent private data, hold minimal data
  getBoardMetaForColor(color: Color): BoardMeta {
    const boardMeta = this.board.getMeta();
    for (let i = 0; i < boardMeta.length; i++) {
      for (let j = 0; j < boardMeta[i].length; j++) {
        const meta = boardMeta[i][j];
        if (meta) {
          if (meta.color !== color) {
            meta.rules = []; // when scouting will be available need to add smarter solution
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
