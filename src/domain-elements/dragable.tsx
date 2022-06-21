import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { positionInRect } from "../utils/collision-detection";

export function dragable(parent: () => Node) {
  const [isActive, setIsActive] = createSignal(false);
  return [
    Node(
      "box",
      {
        rect: {
          dimensions: { width: 20, height: 20 },
          position: { x: 40, y: 40 },
          rotation: 0,
        },
        getPainterCtx: (n) => ({ rect: n.rect, background: "#ff0fff" }),
        onup: () => setIsActive(() => false),
        ondown: (e) => {
          if (!e.mouse) return;
          if (!positionInRect(e.mouse, e.target)) return;
          setIsActive(() => true);
        },
        onmove: (e) => {
          if (!isActive()) return;
          parent().rect.position.setValue(({ x, y }) => {
            return {
              x: x + e.mouse!.dx,
              y: y + e.mouse!.dy,
            };
          });
        },
      },
      parent,
    ),
  ];
}
