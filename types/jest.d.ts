import "jest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainNestedArray(expected: any[][]): R;
    }
  }
}
