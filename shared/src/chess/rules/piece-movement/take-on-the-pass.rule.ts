import { Turn } from "../../turn";
import { PieceType } from "../../piece/piece.constants";
import { Direction } from "./movement-rule";
import { Action } from "../../affect/affect.types";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "./position-specific-movement.rule";
import { directionToVector } from "./straight-movement.rule";
import {
  buildKillAffect,
  buildMoveAffect,
  getUserSelectedMoveAffect,
  markAsUserSelected,
} from "../../affect/affect.utils";

export class TakeOnThePassMovementRule extends PositionSpecificMovementRule {
  constructor({
    id,
    name,
    moveToEmpty,
    moveToKill,
    collision,
    distance,
    directions,
    speed,
    activatePositions,
  }: PositionSpecificMovementRuleConfig) {
    super({
      id,
      name,
      moveToEmpty,
      moveToKill,
      collision,
      distance,
      directions,
      speed,
      activatePositions,
    });
  }

  isNear(from: number, c: number) {
    return from + 1 === c || from - 1 === c;
  }

  private getDirectionModifier(dirrection: Direction) {
    return dirrection === Direction.UpLeft || dirrection === Direction.UpRight
      ? -1
      : +1;
  }

  protected possibleDirrections = [
    Direction.UpLeft,
    Direction.UpRight,
    Direction.DownLeft,
    Direction.DownRight,
  ];

  private pawnFirstDoubleStepDistance = 2;

  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction,
    turns: Turn[]
  ): Action => {
    if (!turns || !turns.length) {
      return [];
    }
    if (!this.activatePositions.y?.has(y)) {
      return [];
    }
    const lastTurn = turns[turns.length - 1];
    const [enemyFromX, enemyFromY] = getUserSelectedMoveAffect(
      lastTurn.affects
    ).from;

    const [toX, toY] = getUserSelectedMoveAffect(lastTurn.affects).to;

    const prevEnemyPos =
      this.getDirectionModifier(dirrection) * this.pawnFirstDoubleStepDistance;

    const [newX, newY] = directionToVector(dirrection, x, y, diff);

    if (
      lastTurn.pieceType === PieceType.Pawn &&
      this.isNear(enemyFromX, x) &&
      enemyFromX === toX &&
      enemyFromY === y + prevEnemyPos &&
      y === toY &&
      enemyFromX === newX
    ) {
      return [
        buildKillAffect([toX, toY]),
        markAsUserSelected(buildMoveAffect([x, y], [newX, newY])),
      ];
    }
    return [];
  };
}
