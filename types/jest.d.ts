import "jest";

declare global {
  namespace jest {
    interface Matchers<R> {
      isEqlAvailableMoves(expected: any[][]): R;
    }
  }
}
