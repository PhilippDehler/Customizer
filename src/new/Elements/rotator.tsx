import { createSignal } from "solid-js";
import {
  angleBetweenTwoVectors,
  dotProduct,
  magnitude,
  positionInRect,
  radToDeg,
  sub,
} from "../../utils";
import { CanvasElement } from "../dom";
import {
  createRelativeSignal,
  getOrigin,
  rotatePoint,
  useHover,
} from "../utils";
import { drawRect } from "../domRender";

export function rotatorElement(parent: () => CanvasElement) {
  const parentIsHovered = useHover(parent);

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
    "rotate",
    relativePosition,
    (ctx, element) => {
      if (!dragger.parent()?.hover()) return;
      drawRect(ctx, element.rectangle(), "#000000");
    }
  );

  dragger.onup(() => {
    setIsActive(false);
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
    setIsActive(true);
  });
}
