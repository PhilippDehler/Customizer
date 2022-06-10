import { createSignal } from "../../core/signal";
import { angleBetweenTwoVectors, positionInRect, sub } from "../../utils";
import { CanvasNode } from "../dom";
import { drawRect } from "../domRender";
import { createRelativeSignal } from "../utils";

export function rotatorElement(parent: () => CanvasNode) {
  const [isActive, setIsActive] = createSignal(false);
  const relativePosition = createRelativeSignal(
    [parent().rectangle, parent().setRectangle],
    (p) => ({
      width: 30,
      height: 30,
      y: p().y - p().height / 2 - 100,
    })
  );
  const dragger = parent().addAndCreateChild(
    "box",
    relativePosition,
    (ctx, drawEvent) => {
      if (
        !(dragger.parent()?.hover() || dragger.parent()?.focus() || isActive())
      )
        return;
      drawRect(ctx, { node: drawEvent.node, color: "#000000" });
    }
  );
  dragger.onup(() => {
    setIsActive(() => false);
  });
  dragger.onmove((e) => {
    if (!isActive()) return;
    e.element.setRectangle((prev) => {
      if (!e.mouse) return prev;
      const angle = angleBetweenTwoVectors(sub(e.mouse, parent().rectangle()), {
        x: 0,
        y: -1,
      });
      return {
        ...prev,
        rotation: angle,
      };
    });
  });
  dragger.ondown((event) => {
    if (!event.mouse) return;
    if (!positionInRect(event.mouse, event.element.rectangle())) return;
    setIsActive(() => true);
  });
}
