import { Game, Turn } from "./game";
import { Color } from "./piece";

export enum WSClientGameEvent {
  Turn = "turn",
  Surrender = "surrender",
}
export enum WSServerGameEvent {
  TurnConfirmed = "turn_confirmed",
  TurnRejected = "turn_rejected",
  OpponentTurn = "opponent_turn",
  SurrenderConfirmed = "surrender_confirmed",
  OpponenSurrender = "opponent_surrender",
  OpponentDisconnected = "opponent_disconnected",
  OpponentWon = "opponent_won",
  YouLost = "you_lost",
}

export class GameMachine {
  constructor(private game: Game) {
    this.initSocketsListening();
  }

  private listeners = new Map<WSClientGameEvent, () => {}>();
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
    this.game[color].socket.on(WSClientGameEvent.Turn, onTurnListener);
    this.listeners[WSClientGameEvent.Turn] = onTurnListener;

    const onSurrenderListener = this.onSurrenderListener(color);
    this.game[color].socket.on(
      WSClientGameEvent.Surrender,
      onSurrenderListener
    );
    this.listeners[WSClientGameEvent.Surrender] = onSurrenderListener;
  }

  private unsubscribeFromGameEvents() {
    this.listeners.forEach((listener, event) => {
      this.game.white.socket.off(event, listener);
      this.game.black.socket.off(event, listener);
    });
  }

  private initSocketsListening() {
    this.subscribeToGameEvents(Color.black);
    this.subscribeToGameEvents(Color.white);

    this.game.black.socket.send("game-started", this.game.blackBoard);
    this.game.white.socket.send("game-started", this.game.whiteBoard);
    this.game.timeStart = new Date().toISOString();
  }

  private handleTurn(color: Color, turn: Turn) {
    try {
      const win = this.game.processTurn(turn);
      if (win) {
        this.game[color].socket.send(WSServerGameEvent.OpponentWon);
        this.game[this.getOppositColor(color)].socket.send(
          WSServerGameEvent.YouLost,
          turn
        );
      } else {
        this.game[color].socket.send(WSServerGameEvent.TurnConfirmed);
        this.game[this.getOppositColor(color)].socket.send(
          WSServerGameEvent.OpponentTurn,
          turn
        );
      }
    } catch (error) {
      this.game[color].socket.send(WSServerGameEvent.TurnRejected, {
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
    this.game[this.getOppositColor(color)].socket.send(
      WSServerGameEvent.OpponenSurrender
    );
    // some confiramtion about receiving surrender needed before unsubscibe
    this.unsubscribeFromGameEvents();
  }
}
