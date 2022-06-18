import { Event } from "../core/event";
import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { Rect } from "../types";
import { wrapRelativePosition as getRelativePosition } from "../utils/calculateRelativePosition";
import { positionInRect } from "../utils/collision-detection";
import { add, rotatePoint, sub } from "../utils/math-utils";

function resizeElement(key: keyof typeof cornerPairs, elementToResize: () => Node) {
  const [isActive, setIsActive] = createSignal(false);
  const [rect, setRect] = createSignal({
    ...cornerPairs[key].corner(elementToResize().rect[0]()),
    width: 10,
    height: 10,
    rotation: 0,
  });

  const relativePosition = getRelativePosition(elementToResize().rect[0], (p) => {
    const s = p();
    const r = cornerPairs[key].corner(s);
    return {
      ...r,
      width: 10,
      height: 10,
    };
  });

  return Node(
    "circle",
    {
      rect: [relativePosition, setRect],
      getPainterCtx: (n) => ({
        background: "#2d82b7",
        lineWidth: 2,
        node: n,
        radius: rect().width / 2,
        strokeStyle: "#2d82b7",
      }),
      onup: () => setIsActive(() => false),
      ondown: (e) => {
        if (!e.mouse) return;
        console.log("click");
        if (!positionInRect(e.mouse, e.target.rect[0]())) return;
        setIsActive(() => true);
      },
      onmove: (e) => {
        if (!e.mouse || !isActive()) return;
        console.log("move", isActive(), e.mouse);
        console.log(e.target.parent?.());

        return e.target.parent?.()?.rect[1]((prev) => {
          if (!e.mouse || (e.mouse.dx === 0 && e.mouse.dy === 0)) return prev;
          console.log("move");

          return resize(key, prev, e);
        });
      },
    },
    elementToResize,
  );
}

export function resizable(parent: () => Node) {
  return Object.keys(cornerPairs).map((key, i) =>
    resizeElement(key as keyof typeof cornerPairs, parent),
  );
}

function resize(key: keyof typeof cornerPairs, prev: Rect, e: Event) {
  if (!e.mouse) return prev;
  const cornerPair = cornerPairs[key];

  // we want to apply the resize by transforming it in not transformated space(NTS)
  // the canvas shows  everthing rotated so we have to rotate our input back to NTS
  const delta = rotatePoint({ x: e.mouse.dx, y: e.mouse.dy }, { x: 0, y: 0 }, -prev.rotation);
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
  const newOppsiteCorner = rotatePoint(rotatedOppsiteCorner, newCenter, -prev.rotation);
  const newCornerPosition = rotatePoint(rotatedCorner, newCenter, -prev.rotation);
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
