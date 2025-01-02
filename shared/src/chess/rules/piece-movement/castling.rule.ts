import { Turn } from "../../turn";
import { PieceType } from "../../piece/piece.constants";
import { Color } from "../../color";
import { Coordinate, isCoordinateEql } from "../../coordinate";
import { MovementRule, MovementRuleMeta } from "./movement-rule";
import { Action } from "../../affect/affect.types";
import { StraightMovementRuleConfig } from "./straight-movement.rule";
import { GetPiece } from "../../get-piece";
import {
  buildMoveAffect,
  getUserSelectedMoveAffect,
  markAsUserSelected,
} from "../../affect/affect.utils";
import { Entity } from "../../entity";

export type CastlingRuleSpecificConfig = {
  mainPieceCoordinate: Coordinate;
  foreginPieceCoordinate: Coordinate;
};

export type CastlingMovementRuleConfig = {
  color: Color;
} & StraightMovementRuleConfig &
  CastlingRuleSpecificConfig &
  Entity;

export type CastlingMovementRuleMeta = MovementRuleMeta & {
  color: Color;
} & CastlingRuleSpecificConfig &
  Entity;

export class CastlingMovementRule extends MovementRule {
  private color: Color;
  constructor({
    id,
    name,
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
    super(
      id,
      name,
      moveToEmpty,
      moveToKill,
      collision,
      distance,
      directions,
      speed
    );
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
      return !!turns.find((turn) => {
        return (
          turn.pieceType === pieceType && // todo turn.pieceType sucks
          turn.color === color &&
          isCoordinateEql(getUserSelectedMoveAffect(turn.affects).from, from)
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

  private isSpaceBeetweenLocked(getPiece: GetPiece) {
    const [mainCoordX, mainCoordY] = this.mainPieceCoordinate;
    const [foreginCoordX, foreginCoordY] = this.foreginPieceCoordinate;
    const sign = this.getSign();
    for (let i = (mainCoordX + 1 * sign) * sign; i < foreginCoordX; i++) {
      if (getPiece(i * sign, mainCoordY)) {
        return true;
      }
    }
    return false;
  }

  protected calculateNewCoord = (): Action => {
    const [mainCoordinateX, mainCoordinateY] = this.mainPieceCoordinate;
    const [foreginCoordinateX, foreginCoordinateY] =
      this.foreginPieceCoordinate;
    const sign = this.getSign();
    const newMainCoordinateX = mainCoordinateX + this.distance * sign;
    return [
      markAsUserSelected(
        buildMoveAffect(this.mainPieceCoordinate, [
          newMainCoordinateX,
          mainCoordinateY,
        ])
      ),
      buildMoveAffect(
        [foreginCoordinateX, foreginCoordinateY],
        [newMainCoordinateX - sign, foreginCoordinateY]
      ),
    ];
  };

  private isPieceNotExist(getPiece: GetPiece, [x, y]: Coordinate) {
    return !getPiece(x, y);
  }

  private isColorDifferent(getPiece: GetPiece, [x, y]: Coordinate) {
    const piece = getPiece(x, y);
    return piece?.color !== this.color;
  }

  public availableMoves(
    _fromX: number,
    _fromY: number,
    getPiece: GetPiece,
    turns: Turn[]
  ): Action[] {
    const moves: Action[] = [];

    if (
      this.isPieceNotExist(getPiece, this.mainPieceCoordinate) ||
      this.isPieceNotExist(getPiece, this.foreginPieceCoordinate) ||
      this.isColorDifferent(getPiece, this.mainPieceCoordinate) ||
      this.isColorDifferent(getPiece, this.foreginPieceCoordinate) ||
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
      this.isSpaceBeetweenLocked(getPiece)
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
