// import { Accessor } from "solid-js";
// import { createSignal } from "../../core/signal";
// import { Position, Rect } from "../../types";
// import { positionInRect } from "../../utils";
// import { CanvasNode } from "../dom";
// import { drawRect } from "../domRender";
// import { createRelativeSignal } from "../utils";

// export function anchorElement(
//   getStartCoords: (parent: () => Rect) => Position,
//   parent: () => CanvasNode,
//   document: CanvasNode
// ) {
//   const [isActive, setIsActive] = createSignal(false);
//   const [snapStart, setSnapStart] = createSignal<Accessor<Rect> | null>(null);
//   const [arrows, setArrows] = createSignal<
//     {
//       start: () => Position;
//       end: () => Position;
//     }[]
//   >([]);

//   const relativeSignal = createRelativeSignal(
//     [parent().rectangle, parent().setRectangle],
//     (p) => ({
//       ...getStartCoords(p),
//       width: 30,
//       height: 30,
//     })
//   );

//   const anchor = parent().addAndCreateChild(
//     "box",
//     relativeSignal,
//     (ctx, drawEvent) => {
//       for (let arrow of arrows()) {
//         const { start, end } = arrow;
//         ctx.beginPath();
//         ctx.moveTo(start().x, start().y);
//         ctx.lineTo(end().x, end().y);

//         ctx.lineWidth = 10;

//         // set line color
//         ctx.strokeStyle = "#ffff00";
//         ctx.stroke();
//       }
//       // if (!isActive() && !parentIsHovered()) return;
//       drawRect(ctx, { node: drawEvent.node, color: "#eeeeee" });
//     }
//   );

//   anchor.addEventListener("up", (e) => {
//     if (!e.mouse) return;
//     setIsActive(() => false);

//     const start = snapStart();
//     if (!start) return null;

//     const anchors = getElementsByKey("anchor", document);
//     const selected = anchors.filter(
//       (a) =>
//         e.element.id() !== a.id() && positionInRect(e.mouse!, a.rectangle())
//     );
//     if (!selected.length) {
//       const s = e.mouse;
//       const newAnchor = anchorElement(
//         () => s,
//         () => document,
//         document
//       );
//       setArrows((prev) => [...prev, { start, end: newAnchor.rectangle }]);
//     } else {
//       setArrows((prev) => [...prev, { start, end: selected[0].rectangle }]);
//     }
//     setSnapStart(() => null);
//   });

//   anchor.addEventListener("move", (e) => {
//     if (!isActive()) return;
//     e.element.setRectangle((prev) => {
//       if (!e.mouse) return prev;
//       return {
//         ...prev,
//         // x: prev.x + e.mouse!.dx,
//         // y: prev.y + e.mouse!.dy,
//       };
//     });
//   });

//   anchor.addEventListener("down", (event) => {
//     if (!event.mouse) return;
//     if (!positionInRect(event.mouse, event.element.rectangle())) return;
//     setSnapStart(() => event.element.rectangle);
//     setIsActive(() => true);
//   });
//   return anchor;
// }

// function getElementsByKey(key: string, element: CanvasNode): CanvasNode[] {
//   if (element.type !== key)
//     return element.children().flatMap((child) => getElementsByKey(key, child));
//   return [
//     element,
//     ...element.children().flatMap((child) => getElementsByKey(key, child)),
//   ];
// }
