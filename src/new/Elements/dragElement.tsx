import { createSignal, onCleanup } from "solid-js";
import { Dimensions } from "../../types";
import { positionInRect } from "../../utils";
import { CanvasElement } from "../dom";
import { Event } from "../event";
import { createRelativeSignal, drawRect, useHover } from "../utils";

export function dragElement(
  dimensions: Dimensions = {
    width: 30,
    height: 30,
  },
  parent: () => CanvasElement
) {
  const parentIsHovered = useHover(parent);
  const [isActive, setIsActive] = createSignal(false);
  const relativeSignal = createRelativeSignal(
    [parent().rectangle, parent().setRectangle],
    (p) => dimensions
  );

  const dragger = parent().addAndCreateChild(
    "drag",
    relativeSignal,
    (ctx, el) => {
      // if (!isActive() && !parentIsHovered()) return;
      drawRect(ctx, el.rectangle(), "#ff0fff");
    }
  );

  dragger.addEventListener("up", () => {
    setIsActive(false);
  });
  function drag(e: Event) {
    if (!isActive()) return;
    e.element.parent()?.setRectangle((prev) => {
      if (!e.mouse) return prev;
      e.stopPropagation?.();
      console.log(e.element.id(), e.element.key, e.eventId);
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
    setIsActive(true);
  });

  return dragger;
}
