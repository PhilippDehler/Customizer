import { Event } from "../core/event";
import { Node } from "../core/node";
import { NodeRectSnapshot } from "../core/nodeRect";
import { createSignal } from "../core/signal";
import { Dimensions } from "../types";
import { positionInRect } from "../utils/collision-detection";
import { add, rotatePoint, sub } from "../utils/math-utils";

function resizeElement(key: keyof typeof cornerPairs, elementToResize: () => Node) {
  const [isActive, setIsActive] = createSignal(false);
  const node = Node(
    "circle",
    {
      rect: {
        dimensions: { width: 10, height: 10 },
        position: cornerPairs[key].corner(elementToResize().rect.dimensions.value()),
        rotation: 0,
      },
      getPainterCtx: (node) => {
        return {
          background: "#2d82b7",
          lineWidth: 2,
          rect: node.rect,
          radius: node.rect.dimensions.value().width / 2,
          strokeStyle: "#2d82b7",
        };
      },
      onup: () => setIsActive(() => false),
      ondown: (e) => {
        if (!e.mouse) return;
        if (!positionInRect(e.mouse, e.target)) return;
        setIsActive(() => true);
      },
      onmove: (e) => {
        if (!e.mouse || !isActive()) return;
        const { dimensions, position, rotation } = resize(
          key,
          elementToResize().rect.getSnapshot(),
          e,
        );
        elementToResize().rect.dimensions.setValue((p) => dimensions);
        elementToResize().rect.position.setValue((p) => position);
        // elementToResize().rect.rotation.setValue((p) => rotation);
      },
    },
    elementToResize,
  );
  elementToResize().rect.dimensions.observe((value) =>
    node.rect.position.setValue(cornerPairs[key].corner(value)),
  );
  // elementToResize().rect.rotation.observe((value) =>
  //   node.rect.position.setValue(cornerPairs[key].corner(value)),
  // );
  // elementToResize().rect.position.observe((value) =>s
  return node;
}

export function resizable(parent: () => Node) {
  return Object.keys(cornerPairs).map((key, i) =>
    resizeElement(key as keyof typeof cornerPairs, parent),
  );
}

function resize(key: keyof typeof cornerPairs, resizeRect: NodeRectSnapshot, e: Event) {
  if (!e.mouse) return resizeRect;
  const cornerPair = cornerPairs[key];
  // we want to apply the resize by transforming it in not transformated space(NTS)
  // the canvas shows  everything rotated so we have to rotate our input back to NTS
  const delta = rotatePoint(
    { x: e.mouse.dx, y: e.mouse.dy },
    { x: 0, y: 0 },
    -resizeRect.absoluteRotation,
  );

  // apply nts-mouse movement to corner
  const c = cornerPair.corner(resizeRect.dimensions);
  const corner = add(c, {
    x: delta.x,
    y: delta.y,
  });
  // rotate corner to rotated space
  const rotatedCorner = rotatePoint(corner, { x: 0, y: 0 }, resizeRect.absoluteRotation);
  // calculate position of oppiste corner in rotated space
  const o = cornerPair.oppositeCorner(resizeRect.dimensions);
  const rotatedOppsiteCorner = rotatePoint(o, { x: 0, y: 0 }, resizeRect.absoluteRotation);
  // now we can calculate the new center
  const centerShift = {
    x: (rotatedOppsiteCorner.x + rotatedCorner.x) / 2,
    y: (rotatedOppsiteCorner.y + rotatedCorner.y) / 2,
  };

  //rotate back and to calculate the new width
  const newOppsiteCorner = rotatePoint(
    rotatedOppsiteCorner,
    centerShift,
    -resizeRect.absoluteRotation,
  );
  const newCornerPosition = rotatePoint(rotatedCorner, centerShift, -resizeRect.absoluteRotation);
  const { x: w, y: h } = sub(newOppsiteCorner, newCornerPosition);

  return {
    rotation: resizeRect.absoluteRotation,
    position: add(resizeRect.position, centerShift),
    dimensions: {
      width: w * cornerPair.resizeDirection.w,
      height: h * cornerPair.resizeDirection.h,
    },
  };
}

const topLeftCorner = (dimensions: Dimensions) => ({
  x: -dimensions.width / 2,
  y: -dimensions.height / 2,
});
const bottomRightCorner = (dimensions: Dimensions) => ({
  x: +dimensions.width / 2,
  y: +dimensions.height / 2,
});
const bottomLeftCorner = (dimensions: Dimensions) => ({
  x: -dimensions.width / 2,
  y: +dimensions.height / 2,
});
const topRightCorner = (dimensions: Dimensions) => ({
  x: +dimensions.width / 2,
  y: -dimensions.height / 2,
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
