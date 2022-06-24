import { createEffect, createSignal, Getter } from "../core-2/reactive";
import { Polar, Vector } from "./types";

const addVector = (v0: Vector, v1: Vector) => v0.map((v, idx) => v + v1[idx]) as Vector;

const getOrigin = (o: Polar[]): Vector => {
  if (!o.length) return [0, 0];
  let currentOrigin: Vector = [0, 0];
  let currentPhiSum = 0;
  for (let i = 0; i < o.length; i++) {
    const polarOffset = o[i];
    currentPhiSum += polarOffset.phi;
    const originOffset: Vector = [
      Math.cos(currentPhiSum) * polarOffset.length,
      Math.sin(currentPhiSum) * polarOffset.length,
    ];
    currentOrigin = addVector(originOffset, currentOrigin);
  }
  return currentOrigin;
};

export function createOrigin(originOffset: Polar, getParentOrigin: Getter<Polar[]>) {
  const [offset, setOffset] = createSignal(originOffset);
  const [origins, setOrigins] = createSignal<Polar[]>([]);
  const [origin, setOrigin] = createSignal<Vector>([0, 0]);

  createEffect(() => {
    setOrigins(() => [...getParentOrigin(), offset()]);
  });
  createEffect(() => {
    setOrigin(() => getOrigin(origins()));
  });
  return { originOffset: offset, setOriginOffset: setOffset, origins, origin };
}
