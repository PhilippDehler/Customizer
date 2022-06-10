import { Setter } from "../core/signal";
import { Position, Rect } from "../types";
import { CanvasNode, Render } from "./dom";
import { rotatePoint } from "./utils";

export const drawSrc: Render<"src"> = (ctx, { node, image }) => {
  console.log(node);

  if (!image) return;
  const rect = node.rectangle();
  console.log(rect);
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.rotation);
  ctx.drawImage(
    image,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height
  );
  ctx.restore();
};

export const drawRect: Render<"box"> = (ctx, drawEvent) => {
  const { x, y, width, height, rotation } = drawEvent.node.rectangle() ?? {};
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  ctx.beginPath();
  ctx.lineWidth = 0;
  ctx.fillStyle = drawEvent.color;
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

  ctx.closePath();
  ctx.fill();
};
export const drawDocument: Render<"src"> = () => {};

export function loadSrc(src: string, rectSignal: Setter<Rect>) {
  const image = new Image();
  function load() {
    rectSignal((prev) => ({
      ...prev,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
    image.removeEventListener("load", load);
  }
  image.addEventListener("load", load);
  image.src = src;
  return image;
}
export const domRenderer = (
  ctx: CanvasRenderingContext2D,
  canvasElement: CanvasNode
) => {
  canvasElement.render(ctx, { node: canvasElement });
  canvasElement.children().forEach((child) => domRenderer(ctx, child));
};
