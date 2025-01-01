import { Action } from "../shared/src";
import { isAffectEql } from "../shared/src/utils/matchers";

export const toMatchActions = (received: Action[], expected: Action[]) => {
  const errors: string[] = [];

  const unmatchedReceived = [...received];

  expected.forEach((expectedAction, i) => {
    const index = unmatchedReceived.findIndex((receivedAction) => {
      if (expectedAction.length !== receivedAction.length) {
        return false;
      }

      return expectedAction.every((expectedAffect, j: number) => {
        return isAffectEql(expectedAffect, receivedAction[j]);
      });
    });

    if (index === -1) {
      errors.push(
        `Received move ${i} doesn't have pair in expected ${JSON.stringify(
          expectedAction,
          null,
          2
        )}`
      );
    } else {
      unmatchedReceived.splice(index, 1);
    }
  });

  if (errors.length === 0) {
    return {
      message: () =>
        `Expected moves ${JSON.stringify(
          received,
          null,
          2
        )} to eql ${JSON.stringify(expected, null, 2)}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Found mismatches:\n${errors.join("\n")}\nReceived: ${JSON.stringify(
          received,
          null,
          2
        )}\nExpected: ${JSON.stringify(expected, null, 2)}`,
      pass: false,
    };
  }
};
