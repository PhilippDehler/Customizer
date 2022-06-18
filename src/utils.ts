import { onCleanup, onMount } from "solid-js";
import { createSignal } from "./core/signal";

export function useElementRect(target: () => Element | undefined) {
  const canvasSig = createSignal({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
  });
  const { observe, unobserve } = makeResizeObserver((entries: ResizeObserverEntry[]) => {
    for (const entry of entries)
      canvasSig[1]((prev) => ({
        ...prev,
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }));
  });
  onMount(() => {
    const { width, height } = target()?.getBoundingClientRect() ?? {};
    canvasSig[1]((prev) => ({
      ...prev,
      width: width ?? 0,
      height: height ?? 0,
    }));
    observe(target()!);
  });
  onCleanup(() => target && unobserve(target()!));
  return canvasSig;
}

export function makeResizeObserver<T extends Element>(
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
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

export function useImageDimensions(src: string) {
  const image = new Image();
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 });
  function load() {
    setDimensions((prev) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
    image.removeEventListener("load", load);
  }
  image.addEventListener("load", load);
  image.src = src;
  return { image, dimensions };
}
