import { createSignal, onCleanup, onMount } from "solid-js";
import { Mouse } from "../types";
import { clearCanvas, createElement, domRenderer } from "./dom";
import { dragElement } from "./Elements/dragElement";
import { eventExecutor } from "./event";
import { resizeContainer } from "./Elements/resizeElements/resizeElement";
import { rotatorElement } from "./Elements/rotator";
import { drawRect, useCanvasRect } from "./utils";
import { anchorElement } from "./Elements/anchorElement";

export function CustomizerCanvas() {
  const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);
  let canvas: HTMLCanvasElement | undefined;
  const fpsCounter = countFps();
  const documentRect = useCanvasRect(canvas);
  const document = createElement("document", documentRect, () => {});
  const box1 = document.addAndCreateChild(
    "box1",
    {
      x: 250,
      y: 250,
      width: 100,
      height: 100,
      rotation: 0,
    },
    (ctx, el) => {
      drawRect(ctx, el.rectangle(), "#000000");
    }
  );

  box1.addChild(dragElement({ width: 30, height: 30 }, () => box1));

  resizeContainer(() => box1);
  rotatorElement(() => box1);
  anchorElement(
    (p) => ({
      x: p().rectangle().x,
      y: p().rectangle().y - p().rectangle().height / 2,
    }),
    () => box1,
    document
  );

  const box2 = document.addAndCreateChild(
    "box",
    {
      x: 400,
      y: 400,
      width: 70,
      height: 70,
      rotation: 0,
    },
    (ctx, el) => {
      drawRect(ctx, el.rectangle(), "#fff000");
    }
  );

  box2.addChild(dragElement({ width: 30, height: 30 }, () => box2));
  resizeContainer(() => box2);
  rotatorElement(() => box2);
  anchorElement(
    (p) => ({
      x: p().rectangle().x,
      y: p().rectangle().y - p().rectangle().height / 2,
    }),
    () => box2,
    document
  );

  document.addAndCreateChild(
    "fpsCounter",
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
          eventExecutor("down", { mouse: mousePosition() });
        }}
        onpointerup={(e) => {
          eventExecutor("up", { mouse: mousePosition() });
        }}
        onPointerLeave={(e) => {
          eventExecutor("up", { mouse: mousePosition() });
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
          eventExecutor("move", { mouse: mousePosition() });
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
          eventExecutor("move", { mouse: mousePosition() });
        }}
        onpointerleave={(e) => {
          eventExecutor("up", { mouse: mousePosition() });
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
