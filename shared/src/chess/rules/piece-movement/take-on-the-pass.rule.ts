import { Turn } from "../../turn";
import { PieceType } from "../../piece.consts";
import { Action, Direction } from "./movement-rule";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "./position-specific-movement.rule";
import { directionToVector } from "./straight-movement.rule";
import { Affect, AffectType } from "../../affect.types";
import {
  buildKillAffect,
  buildMoveAffect,
  getUserSelectedMoveAffect,
  markAsUserSelected,
} from "../../affect.utils";

export class TakeOnThePassMovementRule extends PositionSpecificMovementRule {
  constructor({
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
    const lastTurn = turns[turns.length - 1];
    const [enemyFromX, enemyFromY] = getUserSelectedMoveAffect(
      lastTurn.affects
    ).from;

    const [toX, toY] = getUserSelectedMoveAffect(lastTurn.affects).to;

    const prevEnemyPos =
      this.getDirectionModifier(dirrection) * this.pawnFirstDoubleStepDistance;

    const [newX, newY] = directionToVector(dirrection, x, y, diff);

    if (
      this.activatePositions.y?.has(y) &&
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
