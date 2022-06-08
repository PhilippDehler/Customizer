import { Accessor, createSignal, onCleanup, onMount, Setter } from "solid-js";
import {
  buildDragEffect,
  buildResizeEffect,
  ElementEffect,
} from "./effects/effects";
import { Mouse, Rect } from "./types";
import { positionInRect } from "./utils";

const rect = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

type CanvasElement = {
  element: Accessor<Rect>;
  setElement: Setter<Rect>;

  effect: ElementEffect[];
  draw: (ctx: CanvasRenderingContext2D) => void;

  setHover: (mouse: Mouse | null) => void;
  hover: Accessor<Boolean>;
};

function buildElement(
  element: Accessor<Rect>,
  setElement: Setter<Rect>,
  mousePosition: Accessor<Mouse | null>
): CanvasElement {
  const [hover, setHover] = createSignal(false);
  return {
    element,
    setElement,
    draw: (ctx) => {
      const { x, y, width, height } = element();
      ctx.fillStyle = "#000fff";
      ctx.fillRect(x, y, width, height);
    },
    effect: [buildDragEffect(mousePosition), buildResizeEffect(mousePosition)],

    hover: hover,
    setHover: (mouse) => {
      if (!mouse) return;
      setHover(positionInRect(mouse, element()));
    },
  };
}

export function CustomizerCanvas() {
  const [mousePosition, setMousePosition] = createSignal<Mouse | null>(null);
  const [element, setElement] = createSignal<Rect>({
    rotation: 0,
    x: 200,
    y: 200,
    width: 100,
    height: 100,
  });

  const [elements, setElements] = createSignal<CanvasElement[]>([
    buildElement(element, setElement, mousePosition),
  ]);
  const [hovered, setHovered] = createSignal<CanvasElement[]>([]);
  const [active, setActive] = createSignal<
    {
      el: Accessor<Rect>;
      updater: () => void;
      drawEffect: (ctx: CanvasRenderingContext2D, rect: Rect) => void;
    }[]
  >([]);

  let canvas: HTMLCanvasElement;
  onMount(() => {
    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);

    function loop(t: number) {
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      if (!ctx || !mouse) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements().forEach((e) => e.draw(ctx));

      if (!active().length)
        return hovered().forEach((e) =>
          e.effect.forEach((d) => d.onHover(ctx, e.element()))
        );
      active().forEach((a) => a.updater());

      active().forEach((a) => a.drawEffect(ctx, a.el()));
      setMousePosition((prev) => (prev ? { ...prev, dx: 0, dy: 0 } : null));
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
          setActive(
            elements().flatMap((el) => {
              if (!el.hover()) return [];
              return el.effect.flatMap((eff) => {
                if (!eff.shallSubscribe(mousePosition()!, el.element()))
                  return [];
                return {
                  el: el.element,
                  updater: eff.subscribe(el.setElement, el.element),
                  drawEffect: eff.onExecute,
                };
              });
            })
          );
        }}
        onpointerup={(e) => {
          setActive([]);
        }}
        onPointerLeave={(e) => {
          setActive([]);
        }}
        onpointerenter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition((prev) => {
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            return {
              x,
              y,
              dx: x - (prev?.x ?? 0),
              dy: y - (prev?.y ?? 0),
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
              dx: x - (prev?.x ?? 0),
              dy: y - (prev?.y ?? 0),
            };
          });
          setHovered(
            elements().filter((el) => {
              el.setHover(mousePosition()!);
              return el.hover();
            })
          );
        }}
        onpointerleave={(e) => {
          setMousePosition(null);
        }}
        width={1000}
        height={1000}
      ></canvas>
    </>
  );
}
