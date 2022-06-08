import { Signal } from "solid-js";
import { Position, Rect } from "../types";
import { CanvasElement } from "./dom";
import { rotatePoint } from "./utils";

export function drawSrc(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  canvasImage: HTMLImageElement
) {
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.rotate((rect.rotation * Math.PI) / 180);
  ctx.drawImage(canvasImage, -rect.width / 2, -rect.width / 2);
  ctx.restore();
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  color: string
) {
  const { x, y, width, height } = rect;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  ctx.beginPath();
  ctx.lineWidth = 0;
  ctx.fillStyle = color;
  let r: Position;
  r = rotatePoint({ x: x - halfWidth, y: y - halfHeight }, rect, rect.rotation);
  ctx.moveTo(r.x, r.y);
  r = rotatePoint({ x: x + halfWidth, y: y - halfHeight }, rect, rect.rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x + halfWidth, y: y + halfHeight }, rect, rect.rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x - halfWidth, y: y + halfHeight }, rect, rect.rotation);
  ctx.lineTo(r.x, r.y);
  r = rotatePoint({ x: x - halfWidth, y: y - halfHeight }, rect, rect.rotation);
  ctx.lineTo(r.x, r.y);

  ctx.closePath();
  ctx.fill();
}

export async function loadSrc(src: string, rectSignal: Signal<Rect>) {
  const image = new Image();
  image.addEventListener("load", (e) => {
    rectSignal[1]((prev) => ({
      ...prev,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
  });
  return;
}

export const domRenderer = (
  ctx: CanvasRenderingContext2D,
  canvasElement: CanvasElement
) => {
  canvasElement.render(ctx, canvasElement);
  canvasElement.children().forEach((child) => domRenderer(ctx, child));
};
