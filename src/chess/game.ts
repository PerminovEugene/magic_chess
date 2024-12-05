import { Socket } from "socket.io";
import { Board } from "./board";
import { Color } from "./piece";

export class Player {
  constructor(public socket: Socket, public name: string) {}
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
    this.whiteBoard = this.buildClientBoard(Color.white); // what white player sees
    this.blackBoard = this.buildClientBoard(Color.black); // what black player sees
    this.nextTurnColor = Color.white;
  }
  whiteBoard: Board;
  blackBoard: Board;
  nextTurnColor: Color;
  turns: Turn[];
  result: Color | "draw" | null;
  timeStart: string;
  timeEnd: string | null;

  buildClientBoard(color: Color): Board {
    // TODO
    const clientBoard = new Board();
    for (let i = 0; i < clientBoard.size; i++) {
      for (let j = 0; j < clientBoard.size; j++) {
        const cell = this.board.squares[i][j];
        if (cell.piece) {
          clientBoard.squares[i][j].putPiece(cell.piece);
        }
      }
    }
    return clientBoard;
  }

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
}
