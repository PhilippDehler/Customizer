import { createSignal } from "solid-js";
import { Dimensions } from "../../types";
import { positionInRect } from "../../utils";
import { CanvasElement } from "../dom";
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
  const relativeSignal = createRelativeSignal(parent, (p) => dimensions);

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

  dragger.addEventListener("move", (e) => {
    if (!isActive()) return;

    e.element.setRectangle((prev) => {
      if (!e.mouse) return prev;
      return {
        ...prev,
        x: prev.x + e.mouse!.dx,
        y: prev.y + e.mouse!.dy,
      };
    });
  });

  dragger.addEventListener("down", (event) => {
    //#endregio

    console.log("second");

    if (!event.mouse) return;
    if (!positionInRect(event.mouse, event.element.rectangle())) return;
    setIsActive(true);
  });

  return dragger;
}
