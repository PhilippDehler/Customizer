import { Position } from "../types";
import { rotatePoint } from "../utils/math-utils";
import { Node } from "./node";
import { treeForEach } from "./tree-utils";

export const render = (ctx: CanvasRenderingContext2D, document: Node) => {
  clearCanvas(ctx);
  treeForEach(
    document,
    (node) => node.children(),
    (node) => node.draw(ctx)
  );
};

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const drawRect: PainterByKey["box"] = (ctx, { node, background }) => {
  const { x, y, width, height, rotation } = node.rect[0]() ?? {};
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  ctx.beginPath();
  ctx.lineWidth = 0;
  let r: Position;
  r = rotatePoint({ x: x - halfWidth, y: y - halfHeight }, { x, y }, rotation);
  ctx.moveTo(r.x, r.y);
  r = rotatePoint({ x: x + halfWidth, y: y - halfHeight }, { x, y }, rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x + halfWidth, y: y + halfHeight }, { x, y }, rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x - halfWidth, y: y + halfHeight }, { x, y }, rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x - halfWidth, y: y - halfHeight }, { x, y }, rotation);
  ctx.lineTo(r.x, r.y);
  if (background) {
    ctx.fillStyle = background;
    ctx.fill();
  }

  ctx.closePath();
};

export const getPainter =
  <T extends PainterKeys>(
    key: T,
    buildPainterCtx: () => PainterContextByKey[T]
  ) =>
  (ctx: CanvasRenderingContext2D) =>
    painterByKey[key](ctx, buildPainterCtx());

export type PainterContextByKey = {
  box: { node: Node; background?: string };
  text: { node: Node; fontSize: string; text: string; color: string };
  circle: {
    node: Node;
    background: string;
    radius: number;
    strokeStyle: string;
    lineWidth: number;
  };
  document: { node: Node; background?: string };
  img: { node: Node; img: HTMLImageElement };
};

export type PainterKeys = keyof PainterContextByKey;
export type PainterByKey = {
  [Key in PainterKeys]: (
    canvasCtx: CanvasRenderingContext2D,
    painterCtx: PainterContextByKey[Key]
  ) => void;
};

const drawText: PainterByKey["text"] = (ctx, painterCtx) => {
  ctx.font = `${painterCtx.fontSize} sans`;
  ctx.fillStyle = painterCtx.color;
  const { x, y } = painterCtx.node.rect[0]();
  ctx.fillText(painterCtx.text + "", x, y);
};

export const drawImg: PainterByKey["img"] = (ctx, { node, img }) => {
  const rect = node.rect[0]();
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.rotation);
  ctx.drawImage(
    img,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height
  );
  ctx.restore();
};

export const drawCircle: PainterByKey["circle"] = (
  ctx,
  { node, background, radius, strokeStyle, lineWidth }
) => {
  const { x, y } = node.rect[0]();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 3.1416 * 2, false);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
  ctx.closePath();
};

export const painterByKey: PainterByKey = {
  box: drawRect,
  img: drawImg,
  document: drawRect,
  text: drawText,
  circle: drawCircle,
};
