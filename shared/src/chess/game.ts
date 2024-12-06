import { Board } from "./board";
import { Color } from "./piece";

export class Player {
  constructor(public name: string) {}
}

export enum TurnType {
  Move = "move",
  Skill = "skill",
}

export type Turn = {
  color: Color;
  type: TurnType;
  from: string;
  to: string;
  timestamp: string;
};

export class Game {
  constructor(public white: Player, public black: Player, public board: Board) {
    this.nextTurnColor = Color.white;
  }
  nextTurnColor: Color;
  turns: Turn[] = [];
  result: Color | "draw" | null = null;
  timeStart: string | null = null;
  timeEnd: string | null = null;

  processTurn(turn: Turn): boolean {
    const { color, from, to, type, timestamp } = turn;
    if (this.nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    this.turns.push(turn);
    if (type === TurnType.Move) {
      this.board.move(color, from, to);
    } else {
      this.board.cast(color, from, to);
    }
    return false;
  }

  // returns meta board for color, it hides opponent private data, hold minimal data
  getBoardForColor(color: Color) {
    const coloredBoard: any[][] = Array.from(
      { length: this.board.squares.length },
      () => Array.from({ length: this.board.squares[0].length }, () => null)
    );
    for (let i = 0; i < this.board.squares.length; i++) {
      for (let j = 0; j < this.board.squares[i].length; j++) {
        const cell = this.board.squares[i][j];
        const piece = cell.getPiece();
        if (piece) {
          const meta = piece.getMeta();
          if (piece && piece.color === color) {
            coloredBoard[i][j] = meta;
          } else {
            meta.rules = []; // when scouting will be available need to add smarter solution
            coloredBoard[i][j] = meta;
          }
        }
      }
    }
    return coloredBoard;
  }
}
