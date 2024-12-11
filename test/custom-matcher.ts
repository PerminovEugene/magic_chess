import { Affect, AvailableMove } from "../shared/src";
import { isAffectsEql } from "../shared/src/utils/matchers";

// Custom matcher for comparing AvailableMove arrays
export const isEqlAvailableMoves = (
  received: AvailableMove[],
  expected: AvailableMove[]
): any => {
  if (received.length !== expected.length) {
    return {
      message: () =>
        `Expected moves length ${received.length} to equal ${expected.length}`,
      pass: false,
    };
  }

  const errors: string[] = [];

  for (let i = 0; i < received.length; i++) {
    const [rx, ry, rAffects] = received[i];
    const fit = expected.find(([ex, ey, eAffects]) => {
      return ex === rx && ry === ey && isAffectsEql(rAffects, eAffects);
    });
    if (!fit) {
      errors.push(
        `Received move ${i} doesnt have pair in expected ${JSON.stringify(
          received[i]
        )}`
      );
    }
  }

  if (errors.length === 0) {
    return {
      message: () =>
        `Expected moves ${JSON.stringify(received)} to eql ${JSON.stringify(
          expected
        )}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Found mismatches:\n${errors.join("\n")}\nReceived: ${JSON.stringify(
          received
        )}\nExpected: ${JSON.stringify(expected)}`,
      pass: false,
    };
  }
};
