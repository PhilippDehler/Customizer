import { createSignal, createUniqueId, onCleanup, onMount } from "solid-js";
import { Mouse } from "../types";
import { clearCanvas, createNode } from "./dom";
import { domRenderer, drawRect } from "./domRender";
import { dragElement } from "./Elements/dragElement";
import { imageElement } from "./Elements/imageElement";
import { resizeContainer } from "./Elements/resizeElement";
import { rotatorElement } from "./Elements/rotator";
import { dispatchEvents } from "./event";
import { useCanvasRect } from "./utils";

export function CustomizerCanvas() {
  const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);
  let canvas: HTMLCanvasElement | undefined;
  const fpsCounter = countFps();
  const documentRect = useCanvasRect(canvas);
  const document = createNode("document", {
    rect: documentRect,
    render: () => {},
  });
  const img = imageElement(
    "https://picsum.photos/id/237/200/300",
    () => document
  );
  dragElement({ width: 30, height: 30 }, () => img);
  rotatorElement(() => img);
  const box1 = document.addAndCreateChild(
    "box",
    {
      x: 250,
      y: 250,
      width: 100,
      height: 100,
      rotation: 0,
    },
    (ctx, drawEvent) => {
      drawRect(ctx, { node: drawEvent.node, color: "#000000" });
    }
  );

  dragElement({ width: 30, height: 30 }, () => box1);
  rotatorElement(() => box1);

  resizeContainer(() => img);
  const img1 = imageElement(
    "https://picsum.photos/id/237/200/300",
    () => document
  );
  dragElement({ width: 30, height: 30 }, () => img1);
  rotatorElement(() => img1);

  resizeContainer(() => img1);
  // anchorElement(
  //   (p) => ({
  //     x: p().x,
  //     y: p().y - p().height / 2,
  //   }),
  //   () => box1,
  //   document
  // );

  const box2 = document.addAndCreateChild(
    "box",
    {
      x: 400,
      y: 400,
      width: 70,
      height: 70,
      rotation: 0,
    },
    (ctx, drawEvent) => {
      drawRect(ctx, { node: drawEvent.node, color: "#fff000" });
    }
  );

  dragElement({ width: 30, height: 30 }, () => box2);
  // resizeContainer(() => box2);
  // rotatorElement(() => box2);
  // anchorElement(
  //   (p) => ({
  //     x: p().x,
  //     y: p().y - p().height / 2,
  //   }),
  //   () => box2,
  //   document
  // );

  document.addAndCreateChild(
    "text",
    { x: 0, y: 0, rotation: 0, width: 40, height: 40 },
    (ctx) => {
      ctx.font = "48px serif";
      ctx.fillText(fpsCounter.getFps() + "", 10, 50);
    }
  );

  onMount(() => {
    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);

    function loop(t: number) {
      fpsCounter.tick();
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      if (!ctx || !mouse) return;
      clearCanvas(ctx);
      domRenderer(ctx, document);
    }

    onCleanup(() => cancelAnimationFrame(frame));
  });

  return (
    <>
      <button onclick={() => {}}>Draw</button>
      <canvas
        ref={canvas!}
        class=" bg-slate-500"
        onpointerdown={(e) => {
          dispatchEvents(document, "down", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
          });
        }}
        onpointerup={(e) => {
          dispatchEvents(document, "up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
          });
        }}
        onPointerLeave={(e) => {
          dispatchEvents(document, "up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
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
          dispatchEvents(document, "move", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
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
          dispatchEvents(document, "move", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
          });
        }}
        onpointerleave={(e) => {
          dispatchEvents(document, "up", {
            mouse: mousePosition(),
            eventId: createUniqueId(),
          });
        }}
        width={1000}
        height={1000}
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
