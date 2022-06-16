import { Position, Rect } from "../types";

export const dotProduct = (v0: Position, v1: Position) =>
  v0.x * v1.x + v0.y * v1.y;
export const determinate = (v0: Position, v1: Position) =>
  v0.x * v1.x - v0.y * v1.y;
export const magnitude = (v: Position) => Math.sqrt(v.x ** 2 + v.y ** 2);

export const angleBetweenTwoVectors = (v0: Position, v1: Position) => {
  const angle = Math.atan2(v0.y, v0.x) - Math.atan2(v1.y, v1.x);
  return (angle >= 0 ? angle : angle + Math.PI * 2) % 360;
};

export const sub = (v0: Position, v1: Position) => ({
  x: v0.x - v1.x,
  y: v0.y - v1.y,
});

export const add = (v0: Position, v1: Position) => ({
  x: v0.x + v1.x,
  y: v0.y + v1.y,
});

export const radToDeg = (rad: number) => (rad / Math.PI) * 180;

export function rotatePoint(point: Position, origin: Position, angle: number) {
  const transformedOrigin = sub(point, origin);
  const rotated = add(origin, applyRotationMatrix(transformedOrigin, angle));
  return rotated;
}

export const getOrigin = (rect: Rect) => {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
};

export const applyRotationMatrix = (position: Position, angle: number) => {
  return {
    x: position.x * Math.cos(angle) - position.y * Math.sin(angle),
    y: position.x * Math.sin(angle) + position.y * Math.cos(angle),
  };
};
