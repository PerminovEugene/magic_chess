import { Socket } from "socket.io";
import {
  WSClientGameEvent,
  WSServerGameEvent,
} from "../shared/src/socket/const";
import { Game, Turn } from "../shared/src/chess/game";
import { Color } from "../shared/src/chess/piece";

type Listener = (args: any) => void;
type ListenersMap = Map<WSClientGameEvent, Listener>;

export class GameMachine {
  private sockets: { [key in Color]: Socket };
  private listeners: { [key in Color]: ListenersMap } = {
    [Color.black]: new Map<WSClientGameEvent, Listener>(),
    [Color.white]: new Map<WSClientGameEvent, Listener>(),
  };
  constructor(
    private game: Game,
    whitePlayerSocket: Socket,
    blackPlayerSocket: Socket
  ) {
    this.sockets = {
      [Color.white]: whitePlayerSocket,
      [Color.black]: blackPlayerSocket,
    };
    this.initSocketsListening();
  }

  public isSocketIdInGame(socketId: string) {
    return (
      this.sockets[Color.white].id === socketId ||
      this.sockets[Color.black].id === socketId
    );
  }

  private onTurnListener = (color: Color) => {
    return (turn: Turn) => {
      this.handleTurn(color, turn);
    };
  };
  private onSurrenderListener = (color: Color) => {
    return (turn: Turn) => {
      this.handleSurrender(color, turn);
    };
  };

  private subscribeToGameEvents(color: Color) {
    const onTurnListener = this.onTurnListener(color);
    this.sockets[color].on(WSClientGameEvent.Turn, onTurnListener);
    this.listeners[color].set(WSClientGameEvent.Turn, onTurnListener);

    const onSurrenderListener = this.onSurrenderListener(color);
    this.sockets[color].on(WSClientGameEvent.Surrender, onSurrenderListener);
    this.listeners[color].set(WSClientGameEvent.Surrender, onSurrenderListener);
  }

  private unsubscribeFromGameEvents() {
    for (const color of Object.values(Color)) {
      this.listeners[color].forEach((listener, event) => {
        this.sockets[color].off(event, listener);
      });
    }
  }

  private initSocketsListening() {
    this.subscribeToGameEvents(Color.black);
    this.subscribeToGameEvents(Color.white);
  }
  public beginGame() {
    for (const color of Object.values(Color)) {
      const boardMeta = this.game.getBoardMetaForColor(color);
      const gameInfo = this.game.getNewGameInfoForColor(color);
      this.sockets[color].emit(WSServerGameEvent.GameStarted, {
        boardMeta,
        gameInfo,
      });
    }

    this.game.timeStart = new Date().toISOString();
  }

  private handleTurn(color: Color, turn: Turn) {
    try {
      const gameResult = this.game.processTurn(turn);
      if (gameResult) {
        let messageForBlack = WSServerGameEvent.Stalemate;
        let messageForWhite = WSServerGameEvent.Stalemate;
        if (gameResult === Color.black) {
          messageForBlack = WSServerGameEvent.YouWon;
          messageForWhite = WSServerGameEvent.OpponentWon;
        } else if (gameResult === Color.white) {
          messageForBlack = WSServerGameEvent.OpponentWon;
          messageForWhite = WSServerGameEvent.YouWon;
        }
        this.sockets[this.getOppositColor(Color.white)].emit(
          messageForWhite,
          turn
        );
        this.sockets[this.getOppositColor(Color.black)].emit(
          messageForBlack,
          turn
        );
      } else {
        this.sockets[color].emit(WSServerGameEvent.TurnConfirmed);
        this.sockets[this.getOppositColor(color)].emit(
          WSServerGameEvent.OpponentTurn,
          turn
        );
      }
    } catch (error) {
      console.error(error);
      this.sockets[color].emit(WSServerGameEvent.TurnRejected, {
        reason: "Turn is invalid" + error,
      });
    }
  }

  private getOppositColor(color: Color) {
    return color === Color.white ? Color.black : Color.white;
  }

  private handleSurrender(color: Color, turn: Turn) {
    this.game.result = color === Color.white ? Color.black : Color.white;
    this.game.timeEnd = new Date().toISOString();
    this.sockets[this.getOppositColor(color)].emit(
      WSServerGameEvent.OpponenSurrender
    );
    // some confiramtion about receiving surrender needed before unsubscibe
    this.unsubscribeFromGameEvents();
  }

  private getColorBySocketId(socketId: string) {
    return this.sockets[Color.white].id === socketId
      ? Color.white
      : Color.black;
  }
  public handlePlayerDisconnect(socketId: string) {
    const disconnectedColor = this.getColorBySocketId(socketId);
    const winnerColor = this.getOppositColor(disconnectedColor);
    this.game.result = winnerColor;
    this.game.timeEnd = new Date().toISOString();
    this.sockets[winnerColor].emit(WSServerGameEvent.OpponentDisconnected);
    this.unsubscribeFromGameEvents();
  }
}
