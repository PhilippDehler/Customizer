import { createSignal } from "../../core/signal";
import { Rect } from "../../types";
import { add, positionInRect, sub } from "../../utils";
import { CanvasNode } from "../dom";
import { drawRect } from "../domRender";
import { Event } from "../event";
import { createRelativeSignal, rotatePoint } from "../utils";

function resizeElement(
  key: keyof typeof cornerPairs,
  parent: () => CanvasNode
) {
  const [isActive, setIsActive] = createSignal(false);
  const relativePosition = createRelativeSignal(
    [parent().rectangle, parent().setRectangle],
    (p) => ({
      ...cornerPairs[key].corner(p()),
      width: 30,
      height: 30,
    })
  );

  const resizeBox = parent().addAndCreateChild(
    "box",
    relativePosition,
    (ctx, drawEvent) => {
      // if (!isActive() && !parentIsHovered()) return;
      drawRect(ctx, { node: drawEvent.node, color: "#000111" });
    }
  );

  resizeBox.addEventListener("up", () => {
    setIsActive(() => false);
  });

  resizeBox.addEventListener("down", (event) => {
    if (!event.mouse) return;
    if (!positionInRect(event.mouse, event.element.rectangle())) return;
    setIsActive(() => true);
  });

  resizeBox.addEventListener("move", (e) => {
    if (!e.mouse || !isActive()) return;

    return e.element.parent()?.setRectangle((prev) => {
      if (!e.mouse || (e.mouse.dx === 0 && e.mouse.dy === 0)) return prev;
      return resize(key, prev, e);
    });
  });
}

export function resizeContainer(parent: () => CanvasNode) {
  Object.keys(cornerPairs).forEach((key, i) => {
    resizeElement(key as keyof typeof cornerPairs, parent);
  });
  return parent;
}

function resize(key: keyof typeof cornerPairs, prev: Rect, e: Event) {
  if (!e.mouse) return prev;
  const cornerPair = cornerPairs[key];

  // we want to apply the resize by transforming it in not transformated space(NTS)
  // the canvas shows  everthing rotated so we have to rotate our input back to NTS
  const delta = rotatePoint(
    { x: e.mouse.dx, y: e.mouse.dy },
    { x: 0, y: 0 },
    -prev.rotation
  );
  // apply nts-mouse movement to corner
  const c = cornerPair.corner(prev);
  const corner = add(c, {
    x: delta.x,
    y: delta.y,
  });
  // rotate corner to rotated space
  const rotatedCorner = rotatePoint(corner, prev, prev.rotation);
  // calculate position of oppiste corner in rotated space
  const o = cornerPair.oppositeCorner(prev);
  const rotatedOppsiteCorner = rotatePoint(o, prev, prev.rotation);
  // now we can calculate the new center
  const newCenter = {
    x: (rotatedOppsiteCorner.x + rotatedCorner.x) / 2,
    y: (rotatedOppsiteCorner.y + rotatedCorner.y) / 2,
  };

  //rotate back and to calculate the new width
  const newOppsiteCorner = rotatePoint(
    rotatedOppsiteCorner,
    newCenter,
    -prev.rotation
  );
  const newCornerPosition = rotatePoint(
    rotatedCorner,
    newCenter,
    -prev.rotation
  );
  const { x: w, y: h } = sub(newOppsiteCorner, newCornerPosition);

  return {
    ...prev,
    ...newCenter,

    width: w * cornerPair.resizeDirection.w,
    height: h * cornerPair.resizeDirection.h,
  };
}

const topLeftCorner = (rect: Rect) => ({
  x: rect.x - rect.width / 2,
  y: rect.y - rect.height / 2,
});
const bottomRightCorner = (rect: Rect) => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});
const bottomLeftCorner = (rect: Rect) => ({
  x: rect.x - rect.width / 2,
  y: rect.y + rect.height / 2,
});
const topRightCorner = (rect: Rect) => ({
  x: rect.x + rect.width / 2,
  y: rect.y - rect.height / 2,
});
const cornerPairs = {
  topLeft: {
    corner: topLeftCorner,
    oppositeCorner: bottomRightCorner,
    // points in direction of the oppsite corner
    resizeDirection: { w: 1, h: 1 },
  },
  bottomRight: {
    corner: bottomRightCorner,
    oppositeCorner: topLeftCorner,
    resizeDirection: { w: -1, h: -1 },
  },
  bottomLeft: {
    corner: bottomLeftCorner,
    oppositeCorner: topRightCorner,
    resizeDirection: { w: 1, h: -1 },
  },
  topRight: {
    corner: topRightCorner,
    oppositeCorner: bottomLeftCorner,
    resizeDirection: { w: -1, h: 1 },
  },
};