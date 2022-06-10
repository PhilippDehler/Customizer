import { createSignal } from "../../core/signal";
import { Dimensions } from "../../types";
import { positionInRect } from "../../utils";
import { CanvasNode } from "../dom";
import { drawRect } from "../domRender";
import { Event } from "../event";
import { createRelativeSignal } from "../utils";

export function dragElement(
  dimensions: Dimensions = {
    width: 30,
    height: 30,
  },
  parent: () => CanvasNode
) {
  const [isActive, setIsActive] = createSignal(false);
  const relativeSignal = createRelativeSignal(
    [parent().rectangle, parent().setRectangle],
    (p) => dimensions
  );

  const dragger = parent().addAndCreateChild(
    "box",
    relativeSignal,
    (ctx, drawEvent) => {
      // if (!isActive() && !parentIsHovered()) return;
      drawRect(ctx, { node: drawEvent.node, color: "#ff0fff" });
    }
  );

  dragger.addEventListener("up", () => {
    setIsActive(() => false);
  });
  function drag(e: Event) {
    if (!isActive()) return;
    e.element.parent()?.setRectangle((prev) => {
      if (!e.mouse) return prev;
      e.stopPropagation?.();
      console.log(e.element.id(), e.element.type, e.eventId);
      return {
        ...prev,
        x: prev.x + e.mouse!.dx,
        y: prev.y + e.mouse!.dy,
      };
    });
  }
  dragger.addEventListener("move", drag);
  dragger.addEventListener("down", (event) => {
    if (!event.mouse) return;
    if (!positionInRect(event.mouse, event.element.rectangle())) return;
    setIsActive(() => true);
  });

  return dragger;
}
