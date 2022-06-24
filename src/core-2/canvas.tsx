import { createSignal, onCleanup, onMount } from "solid-js";
// import { resizable } from "../domain-elements/resizable";
import { Mouse } from "../types";

// function Vector(ctx: CanvasRenderingContext2D, origins: Polar[], depth: number = 0): void {
//   if (depth > origin.length) return;
//   const start = calculateAbsoluteOriginFromPolars(origins.slice(0, depth + 1));
//   const end = calculateAbsoluteOriginFromPolars(origins.slice(0, depth + 2));

//   ctx.beginPath();
//   ctx.moveTo(...start);
//   ctx.lineTo(...end);
//   ctx.strokeStyle = "black";
//   ctx.lineWidth = 5;
//   ctx.stroke();
//   ctx.closePath();
//   return Vector(ctx, origins, depth + 1);
// }
// const origins: Polar[] = [
//   { length: 500, phi: Math.PI / 4 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
//   { length: 50, phi: (Math.PI * 3) / 2 },
// ];

export function CustomizerCanvas() {
  let canvas: HTMLCanvasElement | undefined;
  const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);
  const fpsCounter = countFps();
  onMount(() => {
    if (!canvas) return;
    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);

    function loop(t: number) {
      fpsCounter.tick();
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      if (!ctx || !mouse) return;
      // Vector(ctx, origins);
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
        onpointerdown={(e) => {}}
        onpointerup={(e) => {}}
        onPointerLeave={(e) => {}}
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
        }}
        onpointerleave={(e) => {}}
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
