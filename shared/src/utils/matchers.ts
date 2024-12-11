import { Affect } from "../chess";

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
  if (expected.length !== received.length) return false;

  return expected.every((expectedAffect, index) =>
    isAffectEql(expectedAffect, received[index])
  );
};
