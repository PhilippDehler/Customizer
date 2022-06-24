import { DEFAULT_ORIGIN, DEFAULT_PHI } from "./constants";
import { Polar, Vector } from "./types";

export const polarToVector = (polar: Polar): Vector => [
  Math.cos(polar.phi) * polar.length,
  Math.sin(polar.phi) * polar.length,
];

export const vectorToPolar = ([x, y]: Vector): Polar => {
  const length = (x ** 2 + y ** 2) ** 0.5;
  if (Math.acos(x / length) !== Math.asin(y / length))
    throw new Error(`${Math.acos(x / length)} !== ${Math.asin(y / length)}`);
  return { length, phi: Math.acos(x / length) };
};

export const addVector = (v0: Vector, v1: Vector) => v0.map((v, idx) => v + v1[idx]) as Vector;

export const zipWith = <T0, T1, TReturn>(
  items0: T0[],
  items1: T1[],
  callback: (item0: T0, item1: T1, index: number, items0: T0[], items1: T1[]) => TReturn,
) => {
  const larger = items0.length > items1.length ? items0 : items1;
  let result: TReturn[] = [];
  for (let i = 0; i < larger.length; i++) {
    result.push(callback(items0[i], items1[i], i, items0, items1));
  }
  return result;
};
export const map =
  <T, TReturn>(callback: (item: T, index: number, items: T[]) => TReturn) =>
  (items: T[]) =>
    items.map(callback);

export const reduce =
  <T, TReturn>(fold: (previous: TReturn, current: T, index: number, items: T[]) => TReturn) =>
  (initalValue: TReturn) =>
  (items: T[]) =>
    items.reduce(fold, initalValue as TReturn);

export const calculateAbsoluteOriginFromPolars = (polar: Polar[]): Vector => {
  let currentOrigin = DEFAULT_ORIGIN();
  let currentPhiSum = DEFAULT_PHI();
  for (let i = 0; i < polar.length; i++) {
    const polarOffset = polar[i];
    currentPhiSum += polarOffset.phi;
    const originOffset = polarToVector({ phi: currentPhiSum, length: polarOffset.length });
    currentOrigin = addVector(originOffset, currentOrigin);
  }
  return currentOrigin;
};
