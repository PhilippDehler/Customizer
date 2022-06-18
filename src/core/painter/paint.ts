import { Node, PainterContext } from "../node";
import { treeForEach } from "../tree-utils";
import { painterByKey } from "./painter";
import { PainterContextByKey, PainterKeys } from "./types";

export const paint = (
  ctx: CanvasRenderingContext2D,
  document: Node & PainterContext<PainterKeys>,
) => {
  clearCanvas(ctx);
  treeForEach(
    document,
    (node) => node.children(),
    (node) => {
      const painter = painterByKey[node.type];
      //@ts-expect-error
      painter(ctx, node.getPainterCtx(node));
    },
  );
};

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const getPainter =
  <T extends PainterKeys>(key: T, buildPainterCtx: () => PainterContextByKey[T]) =>
  (ctx: CanvasRenderingContext2D) =>
    painterByKey[key](ctx, buildPainterCtx());
