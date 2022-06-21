import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { Position } from "../types";
import { positionInRect } from "../utils/collision-detection";
import { angleBetweenTwoVectors, rotatePoint, sub } from "../utils/math-utils";

export function rotateable(
  parent: () => Node,
  getOriginShift: () => Position = () => ({
    x: 0,
    y: -parent().rect.dimensions.value().height / 2 - 100,
  }),
) {
  const [isActive, setIsActive] = createSignal(false);

  const rotator = Node(
    "box",
    {
      rect: {
        rotation: 0,
        position: {
          x: 0,
          y: -parent().rect.dimensions.value().height / 2 - 100,
        },
        dimensions: { height: 40, width: 40 },
      },
      getPainterCtx: (node) => ({
        background: "#2d82b7",
        lineWidth: 2,
        rect: node.rect,
        radius: node.rect.dimensions.value().width / 2,
        strokeStyle: "#2d82b7",
      }),
    },
    parent,
  );

  parent().addEventListener("up", (e) => setIsActive(() => false));
  parent().addEventListener("down", (e) => {
    if (!e.mouse) return;
    if (!positionInRect(e.mouse, rotator)) return;
    e.stopPropagation();
    setIsActive(() => true);
  });
  parent().addEventListener("move", (e) => {
    if (!isActive()) return;
    parent().rect.rotation.setValue((rotation) => {
      const rot = parent().rect.absoluteRotation.value() - parent().rect.rotation.value();
      const ownCenter = rotator.rect.center.value();
      if (!e.mouse) return rotation;
      const x = rotatePoint(
        rotator.rect.position.value(),
        { x: 0, y: 0 },
        parent().rect.rotation.value(),
      );
      const initalDirection = rotatePoint({ x: 0, y: -1 }, { x: 0, y: 0 }, rot);
      const mouseDirection = sub(e.mouse, ownCenter);
      const angle = angleBetweenTwoVectors(mouseDirection, initalDirection);
      return angle;
    });
  });
  return [rotator];
}
// onmove: (e) => {
//   if (!isActive()) return;
//   parent().rect.rotation.setValue((rotation) => {
//     const rot = parent().rect.absoluteRotation.value() - parent().rect.rotation.value();
//     const ownCenter = rotator.rect.center.value();
//     if (!e.mouse) return rotation;
//     const initalDirection = rotatePoint({ x: 0, y: -1 }, { x: 0, y: 0 }, rot);
//     const mouseDirection = sub(e.mouse, ownCenter);
//     const angle = angleBetweenTwoVectors(mouseDirection, initalDirection);
//     return angle;
//   });
// },
// export function transformOrigin(
//   parent: () => Node,
//   getOriginShift: () => Position = () => ({
//     x: 0,
//     y: +parent().rect.dimensions.value().height / 2 + 100,
//   }),
// ) {
//   const absolutePosition = {
//     x: 0,
//     y: -parent().rect.dimensions.value().height / 2 - 100,
//   };
//   const transformer = Node(
//     "box",
//     {
//       rect: {
//         //origin - shift
//         position: { x: 0, y: 0 },
//         rotation: parent().rect.rotation.value(),
//         dimensions: { height: 50, width: 50 },
//       },
//       getPainterCtx: (node) => ({
//         background: "black",
//         lineWidth: 2,
//         rect: node.rect,
//         radius: node.rect.dimensions.value().width / 2,
//         strokeStyle: "#2d82b7",
//       }),
//     },
//     parent,
//   );
//   parent().rect.center.observe((center) => {
//     const shift = getOriginShift();
//     // log({ transformer_Pos: sub(shift, center), s: parent().parent?.().rect.center.value(), shift });
//     // transformer.rect.position
//     //   .setValue
//     //   // rotatePoint(shift, sub(center, parent().rect.position.value()), 0),
//     //   ();
//   });
//   parent().rect.absoluteRotation.observe((rott) => {
//     console.log(rott);
//     log({
//       transformer_Pos: parent?.().rect.getCanvasCoordinate(),
//       s: transformer.rect.getCanvasCoordinate(),
//       rott: radToDeg(rott),
//     });

//     transformer.rect.rotation.setValue(() => rott);
//     transformer.rect.position.setValue((pos) => {
//       return sub(parent?.().rect.getCanvasCoordinate(), parent().rect.center);
//     });
//   });
//   return transformer;
// }

export function able(p: () => Node) {
  const r = rotateable(p)[0];
  r.addChildren(rotateable);
  return [r];
}
