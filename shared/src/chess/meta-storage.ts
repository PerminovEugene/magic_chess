// import { PieceMeta } from "./piece/piece.types";
// import { PieceType } from "./piece/piece.constants";
// import { Color } from "./color";
// import { BoardMeta } from "./board/board.types";

// export class MetaStorage {
//   constructor() {}
//   private storage: Map<Color, Map<PieceType, PieceMeta>> = new Map([
//     [Color.white, new Map()],
//     [Color.black, new Map()],
//   ]);

//   public fillByBoard(metas: BoardMeta) {
//     for (let i = 0; i < metas.length; i++) {
//       const row = metas[i];
//       for (let j = 0; j < row.length; j++) {
//         const meta = metas[i][j];

//         if (meta) {
//           this.setMeta(meta);
//         }
//       }
//     }
//   }

//   public setMeta(meta: PieceMeta) {
//     this.storage.get(meta.color)!.set(meta.type, meta);
//   }

//   public getMeta(color: Color, type: PieceMeta["type"]): any {
//     return this.storage.get(color)!.get(type);
//   }
// }
