import { Color } from "./piece";

export function reverseColor(color: Color): Color {
  return color === Color.black ? Color.white : Color.black;
}
