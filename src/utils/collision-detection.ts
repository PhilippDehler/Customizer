import { Node } from "../core/node";
import { Position } from "../types";
import { add, rotatePoint } from "./math-utils";

export function positionInRect(position: Position, node: Node) {
  const { height, width } = node.rect.dimensions.value();
  const center = node.rect.center.value();
  const pos = node.rect.position.value();
  const absolute = add(center, pos);
  const { x, y } = rotatePoint(absolute, center, node.rect.absoluteRotation.value());

  return (
    position.x >= x - width / 2 &&
    x + width / 2 >= position.x &&
    position.y >= y - height / 2 &&
    y + height / 2 >= position.y
  );
}
