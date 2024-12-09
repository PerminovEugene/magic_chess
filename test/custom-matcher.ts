// customMatchers.ts
export const toContainNestedArray = (received: any[], expected: any[][]) => {
  const pass = expected.every((innerArray) =>
    received.some(
      (item) =>
        Array.isArray(item) &&
        Array.isArray(innerArray) &&
        item.length === innerArray.length &&
        item.every((val, index) => val === innerArray[index])
    )
  );

  if (pass) {
    return {
      message: () =>
        `Expected ${JSON.stringify(
          received
        )} not to contain nested arrays ${JSON.stringify(expected)}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Expected ${JSON.stringify(
          received
        )} to contain nested arrays ${JSON.stringify(expected)}`,
      pass: false,
    };
  }
};
