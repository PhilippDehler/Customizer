import { createUniqueId, onCleanup, onMount } from "solid-js";
import { dragable } from "../domain-elements/dragable";
import { resizable } from "../domain-elements/resizable";
import { rotateable } from "../domain-elements/rotator";
import { Mouse } from "../types";
import { makeResizeObserver, useElementRect, useImageDimensions } from "../utils";
import { dispatchEvents } from "./event";
import { Node } from "./node";
import { paint } from "./painter/paint";
import { createSignal } from "./signal";

export function CustomizerCanvas() {
  const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);
  let canvas: HTMLCanvasElement | undefined;
  const fpsCounter = countFps();
  const documentRect = useElementRect(() => canvas);
  const document = Node("document", {
    rect: documentRect,
    getPainterCtx: (node) => ({ node }),
  });
  const { dimensions, image } = useImageDimensions("https://picsum.photos/200/300");
  const { image: i2 } = useImageDimensions("https://picsum.photos/300/300");
  document
    .addChild((parent) =>
      Node(
        "text",
        {
          rect: { x: 10, y: 50, rotation: 0, width: 40, height: 40 },
          getPainterCtx: (node) => ({
            text: String(fpsCounter.getFps()),
            fontSize: "48px",
            color: "yellow",
            node,
          }),
        },
        parent,
      ),
    )
    .addChild((parent) =>
      Node(
        "box",
        {
          rect: { x: 400, y: 400, rotation: 0, width: 200, height: 400 },
          getPainterCtx: (node) => ({ node, background: "blue" }),
          resizable,
          dragable,
          rotateable,
        },
        parent,
      ),
    )
    .addChild((parent) =>
      Node(
        "img",
        {
          rect: { x: 500, y: 200, rotation: 0, width: 400, height: 400 },
          getPainterCtx: (node) => ({
            node,
            img: image,
          }),
          resizable,
          dragable,
          rotateable,
        },
        parent,
      ),
    )
    .addChild((parent) =>
      Node(
        "img",
        {
          rect: { x: 430, y: 200, rotation: 0, width: 400, height: 400 },
          getPainterCtx: (node) => ({
            node,
            img: image,
          }),
          resizable,
          dragable,
          rotateable,
        },
        parent,
      ),
    )
    .addChild((parent) =>
      Node(
        "img",
        {
          rect: { x: 450, y: 200, rotation: 0, width: 400, height: 400 },
          getPainterCtx: (node) => ({
            node,
            img: i2,
          }),
          resizable,
          dragable,
          rotateable,
        },
        parent,
      ),
    );
  const { observe, unobserve } = makeResizeObserver((entries: ResizeObserverEntry[]) => {
    for (const entry of entries)
      document.rect[1]((prev) => ({
        ...prev,
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }));
  });
  onCleanup(() => canvas && unobserve(canvas!));
  onMount(() => {
    if (!canvas) return;
    document.rect[1]((prev) => ({
      ...prev,
      x: (canvas?.width ?? 0) / 2,
      y: (canvas?.height ?? 0) / 2,
      width: canvas?.width ?? 0,
      height: canvas?.height ?? 0,
    }));
    observe(canvas!);
    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);

    function loop(t: number) {
      fpsCounter.tick();
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      if (!ctx || !mouse) return;
      paint(ctx, document);
    }

    onCleanup(() => cancelAnimationFrame(frame));
  });

  return (
    <>
      <button onclick={() => {}}>Draw</button>
      <canvas
        ref={canvas!}
        class=" bg-slate-500"
        width={1000}
        height={1000}
        onpointerdown={(e) => {
          dispatchEvents("down", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
        onpointerup={(e) => {
          dispatchEvents("up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
        onPointerLeave={(e) => {
          dispatchEvents("up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
        onpointerenter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition((prev) => {
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            return {
              x,
              y,
              dx: prev?.x ? x - prev.x : 0,
              dy: prev?.y ? y - prev.y : 0,
            };
          });
          dispatchEvents("move", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
        onpointermove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition((prev) => {
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            return {
              x,
              y,
              dx: prev?.x ? x - prev.x : 0,
              dy: prev?.y ? y - prev.y : 0,
            };
          });
          dispatchEvents("move", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
        onpointerleave={(e) => {
          dispatchEvents("up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
            target: document,
          });
        }}
      ></canvas>
    </>
  );
}

function countFps() {
  let time: number[] = [];
  return {
    getFps: () => time.length,
    tick: () => {
      const now = performance.now();
      const sliceIndex = time.findIndex((t) => t >= now - 1000);
      time = time.slice(sliceIndex);
      time.push(now);
    },
  };
}
