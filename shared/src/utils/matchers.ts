import { Action } from "../chess";
import { Affect } from "../chess/affect/affect.types";

const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

export const isAffectEql = (expected: Affect, received: Affect): boolean => {
  return deepEqual(expected, received);
};

export const isAffectsEql = (
  expected: Affect[] | undefined,
  received: Affect[] | undefined
): boolean => {
  if (!expected && !received) return true;
  if (!expected || !received) return false;
  if (expected.length !== received.length) {
    console.log("Mismatch in Affect array length:", { expected, received });
    return false;
  }

  return expected.every((expectedAffect, index) => {
    return isAffectEql(expectedAffect, received[index]);
  });
};

export const isActionsEql = (
  expected: Action[] | undefined,
  received: Action[] | undefined
): boolean => {
  if (!expected && !received) return true;
  if (!expected || !received) return false;
  if (expected.length !== received.length) {
    console.log("Mismatch in Action array length:", { expected, received });
    return false;
  }

  const unmatchedReceived = [...received];

  return expected.every((expectedAction) => {
    const index = unmatchedReceived.findIndex((receivedAction) =>
      deepEqual(expectedAction, receivedAction)
    );
    if (index === -1) {
      console.log("No matching Action found for:", { expectedAction });
      return false;
    }
    unmatchedReceived.splice(index, 1);
    return true;
  });
};
