import { Socket } from "socket.io";
import { Board } from "../shared/src/chess/board/board";
import { Game, Player } from "../shared/src/chess/game";
import { GameInitializer } from "./game-initializer";
import { Color } from "../shared/src";

type QueueItem = {
  player: Player;
  socket: Socket;
};
export class Queue {
  private queue: QueueItem[] = [];

  public enqueue(player: Player, socket: Socket) {
    this.queue.push({ player, socket });
  }

  public dequeue(): QueueItem | undefined {
    return this.queue.pop();
  }
}

export class Matchmaker {
  private queue = new Queue();
  private gameInitializer = new GameInitializer();
  private socketIdsInQueue = new Set<string>();

  public isSocketIdInQueue(socketId: string) {
    return this.socketIdsInQueue.has(socketId);
  }

  public removeSocketFromQueue(socketId: string) {
    this.socketIdsInQueue.delete(socketId);
  }

  public findMatch(player: Player, socket: Socket) {
    const opponent = this.queue.dequeue();
    if (!opponent) {
      this.socketIdsInQueue.add(socket.id);
      this.queue.enqueue(player, socket);
      return null;
    }
    const board = new Board();
    this.gameInitializer.spawnDefaultRulesAndDefaultPosition(board);
    // this.gameInitializer.spawnBeforeTransformPostiion(board);

    const defaultGloobalRules = this.gameInitializer.getDefaultGlobalRules();

    const fifteenMinutes = 5 * 1000; // 45 * 60 *;

    return {
      game: new Game(
        player,
        opponent.player,
        board,
        defaultGloobalRules,
        3,
        new Date(Date.now() + 6000).toISOString(),
        {
          [Color.white]: fifteenMinutes,
          [Color.black]: fifteenMinutes,
        }
      ),
      opponentSocket: opponent.socket,
    };
  }
}
