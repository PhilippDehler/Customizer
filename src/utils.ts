import { Rect, Position } from "./types";

export function positionInRect(position: Position, rect: Rect) {
  return (
    position.x > rect.x - rect.width / 2 &&
    rect.x + rect.width / 2 > position.x &&
    position.y > rect.y - rect.height / 2 &&
    rect.y + rect.height / 2 > position.y
  );
}
export const dotProduct = (v0: Position, v1: Position) =>
  v0.x * v1.x + v0.y * v1.y;
export const determinate = (v0: Position, v1: Position) =>
  v0.x * v1.x - v0.y * v1.y;
export const magnitude = (v: Position) => Math.sqrt(v.x ** 2 + v.y ** 2);

export const angleBetweenTwoVectors = (v0: Position, v1: Position) => {
  const angle = Math.atan2(v0.y, v0.x) - Math.atan2(v1.y, v1.x);
  return (angle >= 0 ? angle : angle + Math.PI * 2) % 360;
};

export const radToDeg = (rad: number) => (rad / Math.PI) * 180;
export const sub = (v0: Position, v1: Position) => ({
  x: v0.x - v1.x,
  y: v0.y - v1.y,
});

export const add = (v0: Position, v1: Position) => ({
  x: v0.x + v1.x,
  y: v0.y + v1.y,
});
console.log(radToDeg(angleBetweenTwoVectors({ x: 0, y: 1 }, { x: 1, y: 1 })));

export const applyRotation = () => {};
