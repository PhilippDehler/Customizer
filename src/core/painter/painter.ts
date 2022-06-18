import { Position } from "../../types";
import { rotatePoint } from "../../utils/math-utils";
import { PainterByKey } from "./types";

export const box: PainterByKey["box"] = (ctx, { node, background }) => {
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

const text: PainterByKey["text"] = (ctx, painterCtx) => {
  ctx.font = `${painterCtx.fontSize} sans`;
  ctx.fillStyle = painterCtx.color;
  const { x, y } = painterCtx.node.rect[0]();
  ctx.fillText(painterCtx.text + "", x, y);
};

export const img: PainterByKey["img"] = (ctx, { node, img }) => {
  const rect = node.rect[0]();
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.rotation);
  ctx.drawImage(img, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
  ctx.restore();
};

export const circle: PainterByKey["circle"] = (
  ctx,
  { node, background, radius, strokeStyle, lineWidth },
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

export const line: PainterByKey["line"] = (ctx, { node, points, color }) => {
  box(ctx, { node, background: "yellow" });
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.moveTo(0, 0);
  points.forEach(({ x, y }, i) => {
    const r = rotatePoint({ x: x, y: y }, node.rect[0](), node.rect[0]().rotation);
    i === 0 ? ctx.moveTo(r.x, r.y) : ctx.lineTo(r.x, r.y);
  });
  ctx.stroke();
  ctx.closePath();
};

export const painterByKey: PainterByKey = {
  box,
  img,
  document: box,
  text,
  circle,
  point: circle,
  line,
};
