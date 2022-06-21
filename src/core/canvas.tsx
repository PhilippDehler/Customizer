import { createUniqueId, onCleanup, onMount } from "solid-js";
import { imageElement } from "../domain-elements/imageElement";
// import { resizable } from "../domain-elements/resizable";
import { Mouse } from "../types";
import { makeResizeObserver } from "../utils";
import { dispatchEvents } from "./event";
import { Node } from "./node";
import { NodeRect } from "./nodeRect";
import { paint } from "./painter/paint";
import { point } from "./painter/painter";
import { createSignal } from "./signal";
export const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);

export function CustomizerCanvas() {
  let canvas: HTMLCanvasElement | undefined;
  const fpsCounter = countFps();
  const doc_Rect = NodeRect(
    {
      dimensions: { width: 1000, height: 1000 },
      position: { x: 500, y: 500 },
      rotation: Math.PI / 4,
    },
    null,
  );
  const document = Node("document", {
    rect: doc_Rect,
    getPainterCtx: (node) => ({ rect: node.rect }),
  });
  document
    .addChild((parent) =>
      Node(
        "text",
        {
          rect: {
            dimensions: { width: 200, height: 200 },
            position: { x: -450, y: -450 },
            rotation: 0,
          },
          getPainterCtx: (node) => ({
            text: String(fpsCounter.getFps()),
            fontSize: "48px",
            color: "yellow",
            rect: node.rect,
          }),
        },
        parent,
      ),
    )
    // .addChild((parent) =>
    //   Node(
    //     "box",
    //     {
    //       rect: {
    //         dimensions: { width: 300, height: 200 },
    //         position: { x: 0, y: 0 },
    //         rotation: 0,
    //       },
    //       getPainterCtx: (node) => ({ rect: node.rect, background: "blue" }),
    //       // resizable,
    //       dragable,
    //       // rotateable,
    //     },
    //     parent,
    //   ),
    // )
    .addChild((p) => imageElement("https://picsum.photos/200/300", p));
  console.log(document);
  // .addChild((parent) =>
  //   Node(
  //     "img",
  //     {
  //       rect: { x: 430, y: 200, rotation: 0, width: 400, height: 400 },
  //       getPainterCtx: (node) => ({
  //         node,
  //         img: image,
  //       }),
  //       resizable,
  //       dragable,
  //       rotateable,
  //     },
  //     parent,
  //   ),
  // )
  // .addChild((parent) =>
  //   Node(
  //     "img",
  //     {
  //       rect: { x: 450, y: 200, rotation: 0, width: 400, height: 400 },
  //       getPainterCtx: (node) => ({
  //         node,
  //         img: i2,
  //       }),
  //       resizable,
  //       dragable,
  //       rotateable,
  //     },
  //     parent,
  //   ),
  // );
  const { observe, unobserve } = makeResizeObserver((entries: ResizeObserverEntry[]) => {
    for (const entry of entries)
      document.rect.dimensions.setValue({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
  });
  onCleanup(() => canvas && unobserve(canvas!));
  onMount(() => {
    if (!canvas) return;
    observe(canvas!);
    document.rect.dimensions.setValue({
      width: canvas.width,
      height: canvas.height,
    });
    document.rect.position.setValue({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });

    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);

    function loop(t: number) {
      fpsCounter.tick();
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      if (!ctx || !mouse) return;

      paint(ctx, document, () => point(canvas?.getContext("2d")!, mousePosition()!));
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
