import { Coordinate, PostMovementRule, RuleMeta } from "../shared/src";
import { Board } from "../shared/src/chess/board/board";
import { BoardMeta } from "../shared/src/chess/board/board.types";
import { Color } from "../shared/src/chess/color";
import { PieceMeta } from "../shared/src/chess/piece/piece.types";
import { PieceType } from "../shared/src/chess/piece/piece.constants";
import { MovementRule } from "../shared/src/chess/rules/piece-movement/movement-rule";
import { CheckMateGlobalRule } from "../shared/src/chess/rules/global/check-mate.global-rule";
import { randomUUID } from "crypto";
import { RulesRepository } from "./rules.repository";
import { PostMovementRuleMeta } from "../shared/src/chess/rules/piece-post-movement/post.movement.types";

export type Position = {
  [key in Color]: { type: PieceType; coordinate: Coordinate }[];
};
export type RulesMeta = {
  movementRules: RuleMeta[];
  postMovementRules?: PostMovementRuleMeta[];
};

export class GameInitializer {
  getDefaultGlobalRules(board: Board) {
    return [new CheckMateGlobalRule()];
  }

  spawnDefaultRulesAndDefaultPosition(board: Board) {
    const whitePawnSpawnLine = 1;
    const blackPawnSpawnLine = 6;
    const whiteSpawnLine = 0;
    const blackSpawnLine = 7;

    const position: Position = {
      [Color.white]: [
        { type: PieceType.Rook, coordinate: [0, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, whiteSpawnLine] },
        { type: PieceType.King, coordinate: [3, whiteSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, whiteSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, whiteSpawnLine] },
      ],
      [Color.black]: [
        { type: PieceType.Rook, coordinate: [0, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, blackSpawnLine] },
        { type: PieceType.King, coordinate: [3, blackSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, blackSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, blackSpawnLine] },
      ],
    };

    for (let i = 0; i <= 7; i++) {
      // todo debug thing

      position[Color.white].push({
        type: PieceType.Pawn,
        coordinate: [i, whitePawnSpawnLine],
      });
      position[Color.black].push({
        type: PieceType.Pawn,
        coordinate: [i, blackPawnSpawnLine],
      });
    }

    this.spawnDefaultRulesCustomPosition(board, position);
    return position;
  }

  private rulesRepository: RulesRepository = new RulesRepository();

  getDefaultRulesForPiece(
    type: PieceType,
    color: Color,
    withPostRulest: boolean = true
  ): RulesMeta {
    switch (type) {
      case PieceType.Pawn:
        return this.rulesRepository.getDefaultPawnRules(color, withPostRulest);
      case PieceType.Rook:
        return this.rulesRepository.getDefaultRookRules(color);
      case PieceType.Bishop:
        return this.rulesRepository.getDefaultBishopRules();
      case PieceType.Knight:
        return this.rulesRepository.getDefaultKnightRules();
      case PieceType.Queen:
        return this.rulesRepository.getDefaultQueenRules();
      case PieceType.King:
        return this.rulesRepository.getDefaultKingRules(color);
    }
  }

  spawnBeforeTransformPostiion(board: Board) {
    const whitePawnSpawnLine = 4;
    const blackPawnSpawnLine = 3;
    const whiteSpawnLine = 0;
    const blackSpawnLine = 7;

    const position: Position = {
      [Color.white]: [
        { type: PieceType.Rook, coordinate: [0, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, whiteSpawnLine] },
        { type: PieceType.King, coordinate: [3, whiteSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, whiteSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, whiteSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, whiteSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, whiteSpawnLine] },
      ],
      [Color.black]: [
        { type: PieceType.Rook, coordinate: [0, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [1, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [2, blackSpawnLine] },
        { type: PieceType.King, coordinate: [3, blackSpawnLine] },

        { type: PieceType.Queen, coordinate: [4, blackSpawnLine] },
        { type: PieceType.Bishop, coordinate: [5, blackSpawnLine] },
        { type: PieceType.Knight, coordinate: [6, blackSpawnLine] },
        { type: PieceType.Rook, coordinate: [7, blackSpawnLine] },
      ],
    };

    for (let i = 0; i <= 7; i++) {
      position[Color.white].push({
        type: PieceType.Pawn,
        coordinate: [i, whitePawnSpawnLine],
      });
      position[Color.black].push({
        type: PieceType.Pawn,
        coordinate: [i, blackPawnSpawnLine],
      });
    }

    this.spawnDefaultRulesCustomPosition(board, position);
    return position;
  }

  buildPieceMeta(
    type: PieceType,
    color: Color,
    rulesMeta: RulesMeta
  ): PieceMeta {
    return {
      id: randomUUID(),
      type,
      color: color as Color,
      movementRulesMeta: rulesMeta.movementRules.map((rule) => rule.id),
      postMovementRulesMeta: rulesMeta.postMovementRules?.map(
        (rule) => rule.id
      ),
    };
  }

  spawnDefaultRulesCustomPosition(
    board: Board,
    position: Position,
    withPostRulest: boolean = true
  ) {
    const meta: BoardMeta = {
      cellsMeta: [],
      movementRules: [],
      postMovementRules: [],
      pieceMeta: [],
    };
    for (let i = 0; i < board.size; i++) {
      meta.cellsMeta.push(new Array(board.size).fill(null));
    }

    for (const color in position) {
      for (const piece of position[color as Color]) {
        const { type, coordinate } = piece;
        const [x, y] = coordinate;

        const rulesMeta = this.getDefaultRulesForPiece(
          type,
          color as Color,
          withPostRulest
        ) as any;

        const pieceMeta = this.buildPieceMeta(type, color as Color, rulesMeta);
        meta.cellsMeta[y][x] = pieceMeta.id;
        meta.movementRules.push(...rulesMeta.movementRules);
        meta.postMovementRules.push(...(rulesMeta.postMovementRules || []));
        meta.pieceMeta.push(pieceMeta);
      }
    }

    // const additionalMeta: PieceMeta[] = [];
    this.rulesRepository.getPawnTransformationPieces().forEach((type) => {
      const rulesMetaBlack = this.getDefaultRulesForPiece(
        //TODO remove ugly stuff
        type,
        Color.black,
        withPostRulest
      ) as any;

      meta.pieceMeta.push(
        this.buildPieceMeta(type, Color.black, rulesMetaBlack)
      );
      meta.movementRules.push(...rulesMetaBlack.movementRules);
      meta.postMovementRules.push(...(rulesMetaBlack.postMovementRules || []));

      const rulesMetaWhite = this.getDefaultRulesForPiece(
        type,
        Color.white,
        withPostRulest
      ) as any;
      meta.pieceMeta.push(
        this.buildPieceMeta(type, Color.white, rulesMetaWhite)
      );
      meta.movementRules.push(...rulesMetaWhite.movementRules);
      meta.postMovementRules.push(...(rulesMetaWhite.postMovementRules || []));
    });

    board.fillBoardByMeta(meta);
  }
}
