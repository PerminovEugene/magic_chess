import { Turn } from "../../game";
import { Color, PieceType } from "../../piece";
import { Coordinate, isCoordinateEql } from "../../coordinate";
import {
  AffectType,
  AvailableMove,
  MovementRule,
  MovementRuleMeta,
} from "./movement-rule";
import { StraightMovementRuleConfig } from "./straight-movement.rule";
import { Cell } from "../../cell";

export type CastlingRuleSpecificConfig = {
  mainPieceCoordinate: Coordinate;
  foreginPieceCoordinate: Coordinate;
};

export type CastlingMovementRuleConfig = {
  color: Color;
} & StraightMovementRuleConfig &
  CastlingRuleSpecificConfig;

export type CastlingMovementRuleMeta = MovementRuleMeta & {
  color: Color;
} & CastlingRuleSpecificConfig;

export class CastlingMovementRule extends MovementRule {
  private color: Color;
  constructor({
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
    color: color,
    mainPieceCoordinate,
    foreginPieceCoordinate,
  }: CastlingMovementRuleConfig) {
    super(moveToEmpty, moveToKill, collision, distance, directions, speed);
    this.color = color;
    this.mainPieceCoordinate = mainPieceCoordinate;
    this.foreginPieceCoordinate = foreginPieceCoordinate;
  }
  public mainPieceCoordinate: CastlingRuleSpecificConfig["mainPieceCoordinate"];
  public foreginPieceCoordinate: CastlingRuleSpecificConfig["foreginPieceCoordinate"];

  private isPieceMoved(
    turns: Turn[],
    pieceType: PieceType,
    color: Color,
    from: Coordinate
  ) {
    if (turns && turns.length) {
      return turns.find((turn) => {
        return (
          turn.pieceType === pieceType &&
          turn.color === color &&
          isCoordinateEql(turn.from, from)
        );
      });
    }
    return false;
  }

  private getSign() {
    const mainCoordinate = this.mainPieceCoordinate;
    const foreginCoordinate = this.foreginPieceCoordinate;
    return mainCoordinate[0] > foreginCoordinate[0] ? -1 : 1;
  }

  private isSpaceBeetweenLocked(squares: Cell[][]) {
    const [mainCoordX, mainCoordY] = this.mainPieceCoordinate;
    const [foreginCoordX, foreginCoordY] = this.foreginPieceCoordinate;
    const sign = this.getSign();
    for (let i = (mainCoordX + 1 * sign) * sign; i < foreginCoordX; i++) {
      if (!squares[mainCoordY][i * sign].isEmpty()) {
        return true;
      }
    }
    return false;
  }

  protected calculateNewCoord = (): AvailableMove => {
    const [mainCoordinateX, mainCoordinateY] = this.mainPieceCoordinate;
    const [foreginCoordinateX, foreginCoordinateY] =
      this.foreginPieceCoordinate;
    const sign = this.getSign();
    const newMainCoordinateX = mainCoordinateX + this.distance * sign;
    const availableMove = [
      newMainCoordinateX,
      mainCoordinateY,
      [
        {
          type: AffectType.move,
          from: [foreginCoordinateX, foreginCoordinateY],
          to: [newMainCoordinateX - sign, foreginCoordinateY],
        },
      ],
    ] as AvailableMove;
    return availableMove;
  };

  private isPieceNotExist(squares: Cell[][], [x, y]: Coordinate) {
    return squares[y][x].isEmpty();
  }

  private isColorDifferent(squares: Cell[][], [x, y]: Coordinate) {
    return squares[y][x].getPiece()?.color !== this.color;
  }

  public availableMoves(
    _fromX: number,
    _fromY: number,
    squares: Cell[][],
    turns: Turn[]
  ): AvailableMove[] {
    const moves: AvailableMove[] = [];
    if (
      this.isPieceNotExist(squares, this.mainPieceCoordinate) ||
      this.isPieceNotExist(squares, this.foreginPieceCoordinate) ||
      this.isColorDifferent(squares, this.mainPieceCoordinate) ||
      this.isColorDifferent(squares, this.foreginPieceCoordinate) ||
      this.isPieceMoved(
        turns,
        PieceType.King,
        this.color,
        this.mainPieceCoordinate
      ) ||
      this.isPieceMoved(
        turns,
        PieceType.Rook,
        this.color,
        this.foreginPieceCoordinate
      ) ||
      this.isSpaceBeetweenLocked(squares)
    ) {
      return moves;
    }

    return [this.calculateNewCoord()];
  }

  getMeta(): CastlingMovementRuleMeta {
    return {
      ...super.getMeta(),
      color: this.color,
      mainPieceCoordinate: [...this.mainPieceCoordinate],
      foreginPieceCoordinate: [...this.foreginPieceCoordinate],
    };
  }
}
