// import { Node } from "../core/node";
// import { createSignal } from "../core/signal";
// import { Position, Rect } from "../types";
// import { wrapRelativePosition } from "../utils/calculateRelativePosition";
// import { add, sub } from "../utils/math-utils";
// import { dragable } from "./dragable";
// import { rotateable } from "./rotator";

// export const pointNode = (parent: () => Node, position: { x: number; y: number }) => {
//   const [rect, setRect] = createSignal({
//     ...parent().rect[0](),
//     ...position,
//   });

//   const relativePosition = wrapRelativePosition(parent().rect[0], (p) => {
//     const s = p();
//     return {
//       ...s,
//       x: s.x + (rect().x - s.x),
//       y: s.y + rect().y - s.y,
//       width: 10,
//       height: 10,
//     };
//   });
//   return Node(
//     "point",
//     {
//       rect: [relativePosition, setRect],
//       getPainterCtx: (node) => ({
//         rect: node.rect[0](),
//         lineWidth: 3,
//         radius: node.rect[0]().width,
//         background: "green",
//         strokeStyle: "blue",
//       }),
//     },
//     parent,
//   );
// };

// export const line = (document: () => Node) => {
//   const [points, setPoints] = createSignal<Position[]>([]);
//   const [active, setActive] = createSignal(false);
//   const [done, setDone] = createSignal(false);
//   const [rect, setRect] = createSignal({ x: 0, y: 0, height: 0, width: 0, rotation: 0 });
//   const set = (x: (prev: Rect) => Rect) => {
//     return setRect((prev) => {
//       const next = x(prev);
//       const shift = sub(next, prev);
//       self
//         .children()
//         .forEach(
//           (child) =>
//             child.type === "point" &&
//             child.rect[1]((p) => ({ ...p, ...(done() ? add(shift, p) : {}) })),
//         );
//       return next;
//     });
//   };

//   const self = Node(
//     "line",
//     {
//       dragable,
//       rotateable,
//       rect: [rect, set],
//       getPainterCtx: (node) => ({
//         color: "black",
//         rect: node.rect[0](),
//         points: active()
//           ? points()
//           : node.children().flatMap((child) => (child.type === "point" ? child.rect[0]() : [])),
//       }),
//       ondown: () => !done() && setActive(() => true),
//       onmove: (e) => e.mouse && active() && !done() && setPoints((p) => [...p, e.mouse!]),
//       onup: () => {
//         if (done() || !active()) return;

//         setPoints((p) => ramerDouglas(p, 5));

//         //create point children
//         const pointChildren = self.children().filter((c) => c.type === "point");
//         const amountOfChildrenNeeded = points().length - pointChildren.length;
//         new Array(amountOfChildrenNeeded)
//           .fill({ x: 0, y: 0 })
//           .forEach((point) => self.addChild((s) => pointNode(s, { ...point })));
//         console.log(self.children());
//         const childrenPoints = self
//           .children()
//           .filter((c) => c.type === "point")
//           .map((child, idx) => {
//             child.rect[1]((p) => ({ ...p, ...points()[idx] }));
//             return child.rect[0]();
//           });

//         set((p) => {
//           const padding = 20;
//           const maxX = Math.max(...childrenPoints.map(({ x }) => x));
//           const minX = Math.min(...childrenPoints.map(({ x }) => x));
//           const maxY = Math.max(...childrenPoints.map(({ y }) => y));
//           const minY = Math.min(...childrenPoints.map(({ y }) => y));
//           return {
//             x: (maxX - minX) / 2 + minX,
//             y: (maxY - minY) / 2 + minY,
//             width: maxX - minX + padding,
//             height: maxY - minY + padding,
//             rotation: p.rotation,
//           };
//         });

//         setActive(() => false);
//         setDone(() => true);
//       },
//     },
//     document,
//   );
//   return self;
// };

// export const squaredDistance = (p0: Position, p1: Position) =>
//   (p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2;
// export const distance = (p0: Position, p1: Position) => squaredDistance(p0, p1) ** 0.5;
// export const multiply_ = (p0: Position, p1: Position) => p0.x * p1.x + p0.y * p1.y;

// export const ramerDouglas = (line: Position[], distanceThreshold: any): Position[] => {
//   if (line.length < 3) return line;
//   const start = line.at(0)!;
//   const end = line.at(-1)!;
//   const distancesSquared = line.map((point) => {
//     return (
//       squaredDistance(start, point) -
//       multiply_(sub(end, start), sub(point, start)) ** 2 / squaredDistance(start, end)
//     );
//   });
//   const max = Math.max(...distancesSquared);
//   if (max < distanceThreshold ** 2) return [start, end];
//   const maxIndex = distancesSquared.indexOf(max);
//   return ramerDouglas(line.slice(0, maxIndex + 1), distanceThreshold).concat(
//     ramerDouglas(line.slice(maxIndex), distanceThreshold).slice(1),
//   );
// };

// //     (begin, end) = (line[0], line[-1]) if line[0] != line[-1] else (line[0], line[-2])

// //     distSq = []
// //     for curr in line[1:-1]:
// //           tmp = (
// // _vec2d_dist(begin, curr) - _vec2d_mult(_vec2d_sub(end, begin), _vec2d_sub(curr, begin)) ** 2 / _vec2d_dist(begin, end))

// //         distSq.append(tmp)

// //     maxdist = max(distSq)
// //     if maxdist < dist ** 2:
// //         return [begin, end]

// //     pos = distSq.index(maxdist)
// //     return (ramerdouglas(line[:pos + 2], dist) +
// //             ramerdouglas(line[pos + 1:], dist)[1:])
