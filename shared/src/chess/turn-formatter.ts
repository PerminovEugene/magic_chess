export function fromChessToLogic(coord: string): [number, number] {
  return [7 - coord.charCodeAt(0) + 97, parseInt(coord[1]) - 1];
}

export function fromLogicToChess(x: number, y: number): string {
  return `${String.fromCharCode(97 + (7 - x))}${y + 1}`;
}

export function fromLogicArrayToChess([x, y]: [number, number]): string {
  return `${String.fromCharCode(97 + (7 - x))}${y + 1}`;
}
