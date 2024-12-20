import { Cell } from "../chess";

export function printCells(cells: Cell[][]) {
  let r = "";
  for (let i = 0; i < cells.length; i++) {
    const row = cells[i];
    let printData = [];

    for (let j = 0; j < row.length; j++) {
      const cell = cells[i][j];
      const piece = cell.getPiece();
      const char = piece ? piece.type[0] + piece.color[0] : "  ";
      printData.push(char);
    }
    r = `${r}
${printData.join("|")}
--------------------`;
  }
  console.log(r);
}
