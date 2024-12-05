import { Board } from "./chess/board";
import { Game, Player } from "./chess/game";

export class Queue {
  private queue: Player[] = [];

  public enqueue(player: Player) {
    this.queue.push(player);
  }

  public dequeue(): Player | null {
    return this.queue.pop();
  }
}

export class Matchmaker {
  private queue = new Queue();

  public findMatch(player: Player): null | Game {
    const opponent = this.queue.dequeue();
    if (!opponent) {
      this.queue.enqueue(player);
      return null;
    }
    const board = new Board();
    return new Game(player, opponent, board);
  }
}
