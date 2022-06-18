import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { wrapRelativePosition } from "../utils/calculateRelativePosition";
import { positionInRect } from "../utils/collision-detection";
import { angleBetweenTwoVectors, sub } from "../utils/math-utils";

export function rotateable(parent: () => Node) {
  const [isActive, setIsActive] = createSignal(false);
  const [rect, setRect] = createSignal({
    ...parent().rect[0](),
    y: parent().rect[0]().y - parent().rect[0]().height / 2 - 100,
    width: 30,
    height: 30,
    rotation: 0,
  });
  const relativePosition = wrapRelativePosition(parent().rect[0], (p) => {
    return {
      ...p(),
      width: 30,
      height: 30,
      y: p().y - p().height / 2 - 100,
    };
  });

  return [
    Node("box", {
      rect: [relativePosition, setRect],
      getPainterCtx: (n) => ({
        background: "#2d82b7",
        lineWidth: 2,
        node: n,
        radius: rect().width / 2,
        strokeStyle: "#2d82b7",
      }),
      onup: () => setIsActive(() => false),
      onmove: (e) => {
        if (!isActive()) return;
        parent().rect[1]((prev) => {
          if (!e.mouse) return prev;
          const angle = angleBetweenTwoVectors(sub(e.mouse, parent().rect[0]()), {
            x: 0,
            y: -1,
          });
          return {
            ...prev,
            rotation: angle,
          };
        });
      },
      ondown: (event) => {
        if (!event.mouse) return;
        if (!positionInRect(event.mouse, event.target.rect[0]())) return;
        setIsActive(() => true);
      },
    }),
  ];
}
