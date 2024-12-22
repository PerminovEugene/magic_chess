import { Board } from "./board";
import { Color, PieceMeta, PieceType } from "./piece";
import { Affect } from "./rules";
import { Coordinate } from "./coordinate";
import { reverseColor } from "./color";
import { coordToKey, MovesTree, parseKey } from "./rules/global/moves-tree";
import { GlobalRule } from "./rules/global/check-mate.global-rule";
import { isAffectEql, isAffectsEql } from "../utils/matchers";

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
  check?: boolean;
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

  getMoveToCoordinatesObj(coordinate: Coordinate) {
    const root = this.movesTree.getRoot();
    return root.movements[coordToKey(coordinate)];
  }

  getAvailableMovementsForCoordinate(from: Coordinate) {
    const movements = this.getMoveToCoordinatesObj(from);
    if (!movements) {
      return;
    }
    const availableCoordinates: Coordinate[] = [];
    for (const toKey in movements) {
      availableCoordinates.push(parseKey(toKey));
    }
    return availableCoordinates;
  }

  getMovementResult(from: Coordinate, to: Coordinate) {
    const movements = this.getMoveToCoordinatesObj(from);
    if (!movements) {
      return;
    }
    return movements[coordToKey(to)];
  }

  processTurn(turn: Turn) {
    const { color, from, to, type, timestamp, affects } = turn;
    if (this.nextTurnColor !== color) {
      throw new Error("Not your turn");
    }
    if (type === TurnType.Move) {
      // this.board.validateTurn(turn, this.turns);

      const root = this.movesTree.getRoot();

      const fromHash = coordToKey(from);
      if (!root.movements[fromHash]) {
        throw new Error("Invalid from coordinate");
      }
      const moveRes = root.movements[fromHash][coordToKey(to)];
      if (!moveRes) {
        throw new Error("Invalid to coordinate");
      }
      if (!isAffectsEql(moveRes.affects, turn.affects)) {
        throw new Error("Invalid move affects");
      }

      // for (const globalRule of this.globalRules) {
      //   if (!globalRule.isMoveValid(root, this.board.squares, turn)) {
      //     throw new Error(
      //       "Move is not valid because of global rule: " +
      //         globalRule.constructor.name
      //     );
      //   }
      // }
      // this.board.move(turn);
      this.turns.push(turn);
      this.movesTree.processTurn(turn.from, turn.to);
    } else {
      this.turns.push(turn);
      this.board.cast(color, from, to);
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
