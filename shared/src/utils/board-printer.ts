import { BoardMeta } from "../chess/board/board.types";

export function printCells({
  cellsMeta: cells,
  pieceMeta: boardPieceMeta,
}: BoardMeta) {
  let r = "";
  for (let i = 0; i < cells.length; i++) {
    const row = cells[i];
    let printData = [];

    for (let j = 0; j < row.length; j++) {
      const pieceMetaId = cells[i][j];
      const pieceMeta = boardPieceMeta.find(({ id }) => id === pieceMetaId);
      const char =
        pieceMetaId && pieceMeta
          ? pieceMeta.type[0] + pieceMeta.color[0]
          : "  ";
      printData.push(char);
    }
    r = `${r}
${printData.join("|")}
-----------------------`;
  }
  console.log(r);
}
