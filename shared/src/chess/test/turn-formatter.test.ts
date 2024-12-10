import { fromChessToLogic, fromLogicArrayToChess } from "../turn-formatter";
import { Coordinate } from "../types";

describe("fromChessToLogic", () => {
  it("should convert chess coordinates to logic coordinates", () => {
    let coord = "a1";
    let expected = [7, 0];
    expect(fromChessToLogic(coord)).toEqual(expected);

    coord = "e4";
    expected = [3, 3];
    expect(fromChessToLogic(coord)).toEqual(expected);

    coord = "h8";
    expected = [0, 7];
    expect(fromChessToLogic(coord)).toEqual(expected);
  });
});

describe("fromLogicToChess", () => {
  it("should convert chess coordinates to logic coordinates", () => {
    let coord: Coordinate = [7, 0];
    let expected = "a1";
    expect(fromLogicArrayToChess(coord)).toEqual(expected);

    expected = "e4";
    coord = [3, 3];
    expect(fromLogicArrayToChess(coord)).toEqual(expected);

    expected = "h8";
    coord = [0, 7];
    expect(fromLogicArrayToChess(coord)).toEqual(expected);
  });
});
