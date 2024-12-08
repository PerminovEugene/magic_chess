import { fromChessToLogic, fromLogicArrayToChess } from "../turn-formatter";

describe("fromChessToLogic", () => {
  it("should convert chess coordinates to logic coordinates", () => {
    // Test case 1
    let coord = "a1";
    let expected = [7, 0];
    expect(fromChessToLogic(coord)).toEqual(expected);

    // Test case 2
    coord = "e4";
    expected = [3, 3];
    expect(fromChessToLogic(coord)).toEqual(expected);

    // Test case 3
    coord = "h8";
    expected = [0, 7];
    expect(fromChessToLogic(coord)).toEqual(expected);
  });
});

describe("fromLogicToChess", () => {
  it("should convert chess coordinates to logic coordinates", () => {
    // Test case 1
    let coord: [number, number] = [7, 0];
    let expected = "a1";
    expect(fromLogicArrayToChess(coord)).toEqual(expected);

    // Test case 2
    expected = "e4";
    coord = [3, 3];
    expect(fromLogicArrayToChess(coord)).toEqual(expected);

    // Test case 3
    expected = "h8";
    coord = [0, 7];
    expect(fromLogicArrayToChess(coord)).toEqual(expected);
  });
});
