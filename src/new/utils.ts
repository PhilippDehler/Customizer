import { Accessor, createSignal, onCleanup, onMount, Signal } from "solid-js";
import { Nullable, Position, Rect } from "../types";
import { add, positionInRect, sub } from "../utils";
import { CanvasNode } from "./dom";

export function useHover(element: () => CanvasNode): Accessor<boolean> {
  const [hover, setHover] = createSignal(false);
  element()?.addEventListener("move", (event) => {
    if (!event.mouse) return setHover(false);
    const rect = element().rectangle();

    const isHovered = positionInRect(event.mouse, rect); //#endregion

    return setHover(isHovered);
  });
  return hover;
}

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

export const getOrigin = (rect: Rect) => {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
};

export const applyRotation = (position: Position, angle: number) => {
  return {
    x: position.x * Math.cos(angle) - position.y * Math.sin(angle),
    y: position.x * Math.sin(angle) + position.y * Math.cos(angle),
  };
};

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

export function elementSnapshot(canvasElement: CanvasNode): any {
  return {
    ...canvasElement,
    children: canvasElement.children().map(elementSnapshot),
  };
}
