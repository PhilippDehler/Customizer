import { Position } from "../../types";
import { add, rotatePoint } from "../../utils/math-utils";
import { PainterByKey } from "./types";

export const box: PainterByKey["box"] = (ctx, { rect, background }) => {
  const center = rect.center.value();
  const printOrigin = add(rect.position.value(), center);
  const absoluteRotation = rect.absoluteRotation.value();

  const { width, height } = rect.dimensions.value();
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  let r: Position;
  ctx.beginPath();
  r = rect.getCanvasCoordinate({ x: -halfWidth, y: -halfHeight });
  ctx.moveTo(r.x, r.y);
  r = rect.getCanvasCoordinate({ x: +halfWidth, y: -halfHeight });
  ctx.lineTo(r.x, r.y);
  r = rect.getCanvasCoordinate({ x: +halfWidth, y: +halfHeight });
  ctx.lineTo(r.x, r.y);
  r = rect.getCanvasCoordinate({ x: -halfWidth, y: +halfHeight });
  ctx.lineTo(r.x, r.y);
  r = rect.getCanvasCoordinate({ x: -halfWidth, y: -halfHeight });
  ctx.lineTo(r.x, r.y);
  ctx.fillStyle = background ?? "transparent";
  ctx.fill();
  ctx.closePath();
  drawDirection(
    ctx,
    rotatePoint({ x: printOrigin.x, y: printOrigin.y }, center, absoluteRotation),
    rect.absoluteRotation.value(),
    "green",
  );
  drawDirection(
    ctx,
    rotatePoint({ x: printOrigin.x, y: printOrigin.y }, center, absoluteRotation),
    rect.rotation.value(),
    "red",
  );
};

const text: PainterByKey["text"] = (ctx, { rect, fontSize, color, text }) => {
  const center = rect.center.value();
  const { x, y } = rect.position.value();
  ctx.font = `${fontSize} sans`;
  ctx.fillStyle = color;
  const { width, actualBoundingBoxAscent: height } = ctx.measureText(text);
  ctx.fillText(text + "", x + center.x - width / 2, y + center.y + height / 2);
};

export const img: PainterByKey["img"] = (ctx, { rect, img }, origin) => {
  const center = rect.center.value();
  const { x, y } = rect.position.value();
  const rotation = rect.absoluteRotation.value();
  const { width, height } = rect.dimensions.value();
  ctx.save();
  ctx.translate(center.x + x, center.y + y);
  ctx.rotate(rotation);
  ctx.drawImage(img, 0 - width / 2, 0 - height / 2, width, height);
  ctx.restore();
  drawDirection(ctx, add(center, { x, y }), rect.absoluteRotation.value(), "green");
  drawDirection(ctx, add(center, { x, y }), rect.rotation.value(), "red");
};

function drawDirection(
  ctx: CanvasRenderingContext2D,
  center: Position,
  rotation: number,
  color: string,
) {
  // const ownCenter = add(center, rect.position.value());
  let end = rotatePoint(add({ x: 0, y: -50 }, center), center, rotation);

  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.closePath();
  ctx.beginPath();
  ctx.arc(center.x, center.y, 2, 0, 3.1416 * 2, false);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();

  // end = rotatePoint(add({ x: 0, y: -50 }, center), center, rect.rotation.value());

  // ctx.beginPath();
  // ctx.moveTo(center.x, center.y);
  // ctx.lineTo(end.x, end.y);
  // ctx.strokeStyle = "blue";
  // ctx.lineWidth = 5;
  // ctx.stroke();

  // ctx.closePath();
  // ctx.beginPath();
  // ctx.arc(center.x, center.y, 10, 0, 3.1416 * 2, false);
  // ctx.fillStyle = "blue";
  // ctx.fill();
  // ctx.lineWidth = 3;
  // ctx.strokeStyle = "black";
  // ctx.stroke();
  // ctx.closePath();
}

export function point(ctx: CanvasRenderingContext2D, mouse: Position) {
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 5, 0, 3.1416 * 2, false);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.font = `${25}px sans`;
  ctx.fillStyle = "white";
  const { width, actualBoundingBoxAscent: height } = ctx.measureText(
    `x:${mouse.x.toFixed(6)},y:${mouse.y.toFixed(6)}`,
  );
  ctx.fillText(
    `x:${mouse.x.toFixed(6)},y:${mouse.y.toFixed(6)}` + "",
    mouse.x - width / 2,
    mouse.y,
  );
  ctx.closePath();
}
export const circle: PainterByKey["circle"] = (
  ctx,
  { background, radius, strokeStyle, lineWidth, rect },
) => {
  const center = rect.center.value();
  const { x, y } = add(rect.position.value(), center);
  const absoluteRotation = rect.absoluteRotation.value();
  const c = rotatePoint({ x: x, y: y }, center, absoluteRotation);
  ctx.beginPath();
  ctx.arc(c.x, c.y, radius, 0, 3.1416 * 2, false);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
  ctx.closePath();
};

export const line: PainterByKey["line"] = (ctx, { rect, points, color }) => {
  // box(ctx, { rect, background: "yellow" }, origin);
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.moveTo(0, 0);
  // points.forEach(({ x, y }, i) => {
  //   const position = add(origin, { x, y });
  //   const r = rotatePoint(position, origin, rect.rotation);
  //   i === 0 ? ctx.moveTo(r.x, r.y) : ctx.lineTo(r.x, r.y);
  // });
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
