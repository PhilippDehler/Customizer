import { Position } from "../../types";
import { Node, PainterContext } from "../node";
import { painterByKey } from "./painter";
import { PainterContextByKey, PainterKeys } from "./types";

export const paint = (
  ctx: CanvasRenderingContext2D,
  document: Node & PainterContext<PainterKeys>,
  additinalDraw: () => void,
) => {
  // console.log(mousePosition());
  clearCanvas(ctx);

  recursivePaint(document, (node, stack) => {
    const painter = painterByKey[node.type];
    //@ts-expect-error
    painter(ctx, node.getPainterCtx(node));
  });
  additinalDraw();
};

export function recursivePaint(
  node: Node,
  fn: (node: Node, rotationStack: { rotation: number; center: Position }[]) => void,
  rotationStack: { rotation: number; center: Position }[] = [],
) {
  const stack = [
    ...rotationStack,
    { rotation: node.rect.rotation.value(), center: node.rect.center.value() },
  ];

  fn(node, stack);
  node.children().forEach((n) => recursivePaint(n, fn, stack));
}

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const getPainter =
  <T extends PainterKeys>(key: T, buildPainterCtx: () => PainterContextByKey[T]) =>
  (ctx: CanvasRenderingContext2D, origin: Position) =>
    painterByKey[key](ctx, buildPainterCtx(), origin);
