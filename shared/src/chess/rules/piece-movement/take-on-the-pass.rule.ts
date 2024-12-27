import { Turn } from "../../turn";
import { PieceType } from "../../piece.consts";
import { AvailableMove, Direction } from "./movement-rule";
import {
  PositionSpecificMovementRule,
  PositionSpecificMovementRuleConfig,
} from "./position-specific-movement.rule";
import { directionToVector } from "./straight-movement.rule";
import { Affect, AffectType } from "../../affect.types";

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

  private getAffect(toX: number, toY: number): Affect {
    return {
      type: AffectType.kill,
      from: [toX, toY],
    };
  }

  private pawnFirstDoubleStepDistance = 2;

  protected calculateNewCoord = (
    x: number,
    y: number,
    diff: number,
    dirrection: Direction,
    turns: Turn[]
  ): AvailableMove => {
    if (!turns || !turns.length) {
      return [x, y];
    }
    const lastTurn = turns[turns.length - 1];
    const [enemyFromX, enemyFromY] = lastTurn.from;
    const [toX, toY] = lastTurn.to;

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
      const affect = this.getAffect(toX, toY);
      return [newX, newY, [affect]];
    }
    return [x, y];
  };
}
