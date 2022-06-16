import { Position, Rect } from "../types";

export function positionInRect(position: Position, rect: Rect) {
  return (
    position.x >= rect.x - rect.width / 2 &&
    rect.x + rect.width / 2 >= position.x &&
    position.y >= rect.y - rect.height / 2 &&
    rect.y + rect.height / 2 >= position.y
  );
}
