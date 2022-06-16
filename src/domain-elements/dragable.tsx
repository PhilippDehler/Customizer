import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { wrapRelativePosition } from "../utils/calculateRelativePosition";
import { positionInRect } from "../utils/collision-detection";

export function dragable(parent: () => Node) {
  const [isActive, setIsActive] = createSignal(false);
  const [rect, setRect] = createSignal({
    ...parent().rect[0](),
  });

  const relativePosition = wrapRelativePosition(parent().rect[0], (p) => ({
    ...p(),
    width: 30,
    height: 30,
  }));
  return [
    Node("box", {
      rect: [relativePosition, setRect],
      getPainterCtx: (node) => ({ node, background: "#ff0fff" }),
      onup: () => setIsActive(() => false),
      ondown: (event) => {
        if (!event.mouse) return;
        if (!positionInRect(event.mouse, event.target.rect[0]())) return;
        setIsActive(() => true);
      },
      onmove: (e) => {
        if (!isActive()) return;
        parent()?.rect[1]((prev) => {
          if (!e.mouse) return prev;
          return {
            ...prev,
            x: prev.x + e.mouse!.dx,
            y: prev.y + e.mouse!.dy,
          };
        });
      },
    }),
  ];
}
