import "jest";
import { Action } from "../shared/src";

declare global {
  namespace jest {
    interface Matchers<R extends Action[]> {
      toMatchActions(expected: Action[]): R;
    }
  }
}
