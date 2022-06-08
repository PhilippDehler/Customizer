import { createEffect, createSignal, observable } from "solid-js";
import { createElement } from "../dom";

function createDocument(canvas: HTMLCanvasElement) {
  const canvasSig = createSignal({
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    rotation: 0,
  });
  createEffect(() => {
    const resize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries)
        canvasSig[1]((prev) => ({
          ...prev,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        }));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.unobserve(canvas);
  });

  const document = createElement("document", canvasSig, (ctx, el) => {});
  return document;
}
