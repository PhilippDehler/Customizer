import {
  Accessor,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Signal,
} from "solid-js";
import { Dimensions, Position, Rect, Rotation } from "../types";
import { add, positionInRect, radToDeg, sub } from "../utils";
import { CanvasElement } from "./dom";

export function useHover(element: () => CanvasElement): Accessor<boolean> {
  const [hover, setHover] = createSignal(false);
  element()?.addEventListener("move", (event) => {
    if (!event.mouse) return setHover(false);
    const rect = element().rectangle();

    const isHovered = positionInRect(event.mouse, rect); //#endregion

    return setHover(isHovered);
  });
  return hover;
}
export type Nullable<T> = { [Key in keyof T]?: T[Key] };

export function createRelativeSignal(
  relativeRectSignal: Signal<Rect>,
  calcOffset?: (relativeRect: () => Rect) => Nullable<Rect>
): Signal<Rect> {
  return [
    () => {
      const offset = calcOffset?.(relativeRectSignal[0]) ?? {};
      const rotation = rotatePoint(
        { ...relativeRectSignal[0](), ...offset },
        relativeRectSignal[0](),
        relativeRectSignal[0]().rotation
      );
      return {
        ...relativeRectSignal[0](),
        ...offset,
        ...rotation,
      };
    },
    relativeRectSignal[1],
  ];
}
export function wrapRelativePosition() {}

export function rotatePoint(point: Position, origin: Position, angle: number) {
  const transformedOrigin = sub(point, origin);
  const rotated = add(origin, applyRotation(transformedOrigin, angle));
  return rotated;
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  color: string
) {
  const { x, y, width, height } = rect;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  ctx.fillStyle = color;
  ctx.beginPath();

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

export const getOrigin = (rect: Rect) => {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
};

export const applyRotation = (position: Position, angle: number) => {
  return {
    x: position.x * Math.cos(angle) - position.y * Math.sin(angle),
    y: position.x * Math.sin(angle) + position.y * Math.cos(angle),
  };
};

console.log(applyRotation({ x: 0, y: 1 }, Math.PI / 2));

export function useCanvasRect(target: Element | undefined) {
  const canvasSig = createSignal({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
  });
  const { observe, unobserve } = makeResizeObserver(
    (entries: ResizeObserverEntry[]) => {
      for (const entry of entries)
        canvasSig[1]((prev) => ({
          ...prev,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        }));
    }
  );
  onMount(() => {
    const { width, height } = target?.getBoundingClientRect() ?? {};
    canvasSig[1]((prev) => ({
      ...prev,
      width: width ?? 0,
      height: height ?? 0,
    }));
    observe(target!);
  });
  onCleanup(() => target && unobserve(target));
  return canvasSig;
}

export function makeResizeObserver<T extends Element>(
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): {
  observe: (ref: T) => void;
  unobserve: (ref: T) => void;
} {
  const resizeObserver = new ResizeObserver(callback);
  onCleanup(resizeObserver.disconnect.bind(resizeObserver));
  return {
    observe: (ref) => ref && resizeObserver.observe(ref, options),
    unobserve: resizeObserver.unobserve.bind(resizeObserver),
  };
}

export function elementSnapshot(canvasElement: CanvasElement): any {
  return {
    ...canvasElement,
    children: canvasElement.children().map(elementSnapshot),
  };
}
