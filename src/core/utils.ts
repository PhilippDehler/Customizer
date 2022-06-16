import { onCleanup, onMount } from "solid-js";
import { makeResizeObserver } from "../utils";
import { createSignal } from "./signal";

export function buildIncrementor() {
  let i = 0;
  return () => i++;
}

const increment = buildIncrementor();
export const createUniqueId = () => {
  return `canva-id-${increment()}`;
};

export function useCanvasRect(target: () => Element | undefined) {
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
          x: entry.contentRect.width / 2,
          y: entry.contentRect.height / 2,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        }));
    }
  );
  onMount(() => {
    if (target()) return;
    const { width = 0, height = 0 } = target()?.getBoundingClientRect() ?? {};
    canvasSig[1]((prev) => ({
      ...prev,
      width: width,
      height: height,
    }));
    observe(target()!);
  });
  onCleanup(() => target() && unobserve(target()!));
  return canvasSig;
}
