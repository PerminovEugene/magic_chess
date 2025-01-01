export enum Color {
  white = "white",
  black = "black",
}

export function reverseColor(color: Color): Color {
  return color === Color.black ? Color.white : Color.black;
}
