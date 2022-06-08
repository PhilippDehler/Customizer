import { Accessor, createSignal, Setter } from "solid-js";
import { Mouse, Rect } from "../types";
import { positionInRect } from "../utils";

export type ElementEffect = {
  key: string;

  onHover: (ctx: CanvasRenderingContext2D, rect: Rect) => void;
  onExecute: (ctx: CanvasRenderingContext2D, rect: Rect) => void;

  subscribe: (setRect: Setter<Rect>, rect: Accessor<Rect>) => () => void;
  shallSubscribe: (mouse: Mouse, rect: Rect) => boolean;
  unSubscribe: () => void;
};

export function buildDragEffect(
  mousePosition: Accessor<Mouse | null>
): ElementEffect {
  return {
    key: "drag",
    subscribe: (setRect: Setter<Rect>) => {
      return () => {
        const mouse = mousePosition();
        if (!mouse) return () => {};
        return setRect((prev) => ({
          ...prev,
          x: prev.x + mouse?.dx ?? 0,
          y: prev.y + mouse?.dy ?? 0,
        }));
      };
    },

    onHover: (ctx: CanvasRenderingContext2D, rect: Rect) => {
      const dimensions = { width: 30, height: 30 };
      const { x, y, width, height } = rect;
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        x + width / 2 - dimensions.width / 2,
        y + height / 2 - dimensions.height / 2,
        dimensions.width,
        dimensions.height
      );
    },

    onExecute: (ctx: CanvasRenderingContext2D, rect: Rect) => {
      const dimensions = { width: 30, height: 30 };
      const { x, y, width, height } = rect;
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        x + width / 2 - dimensions.width / 2,
        y + height / 2 - dimensions.height / 2,
        dimensions.width,
        dimensions.height
      );
    },
    shallSubscribe: (mouse, rect) => {
      const dimensions = { width: 30, height: 30 };
      return positionInRect(mouse, {
        ...rect,
        x: rect.x + rect.width / 2 - dimensions.width / 2,
        y: rect.y + rect.height / 2 - dimensions.height / 2,
        width: dimensions.width,
        height: dimensions.height,
      });
    },
    unSubscribe: () => {},
  };
}

export function buildResizeEffect(
  mousePosition: Accessor<Mouse | null>
): ElementEffect {
  const [activeResizer, setActiveResizer] = createSignal<
    ReturnType<typeof getResizer>[number] | null
  >(null);

  function getResizer(rect: Rect) {
    const { x, y, width, height } = rect;
    const boxDim = { width: 10, height: 10 };
    const addingTable = [
      [1, 1, -1, -1],
      [1, 0, -1, 0],
      [1, 0, -1, 1],
      [0, 0, 0, 1],
      [0, 0, 1, 1],
      [0, 0, 1, 0],
      [0, 1, 1, -1],
      [0, 1, 0, -1],
    ];
    return [
      //left top corner
      {
        x: x,
        y: y,
        ...boxDim,
      },

      //left middle corner
      {
        x: x,
        y: y + (height - boxDim.height) / 2,
        ...boxDim,
      },
      //left bottom corner
      {
        x: x,
        y: y - boxDim.height + height,
        ...boxDim,
      },
      // middle bottom corner

      {
        x: x + (width - boxDim.width) / 2,
        y: y - boxDim.height + height,
        ...boxDim,
      },

      //right bottom corner
      {
        x: x - boxDim.width + width,
        y: y - boxDim.height + height,
        ...boxDim,
      },

      // right middle corner
      {
        x: x - boxDim.width + width,
        y: y + (height - boxDim.height) / 2,
        ...boxDim,
      },

      //right top corner
      {
        x: x + width - boxDim.width,
        y: y,
        ...boxDim,
      },

      // right middle corner
      {
        x: x + (width - boxDim.width) / 2,
        y: y,
        ...boxDim,
      },
    ].map((box, idx) => ({
      ...box,
      resize: (rect: Accessor<Rect>) => {
        const { x, y, width, height } = rect();
        const mouse = mousePosition();
        if (!mouse) return;
        const factors = addingTable[idx];
        return {
          x: x + factors[0] * mouse.dx,
          y: y + factors[1] * mouse.dy,
          width: width + factors[2] * mouse.dx,
          height: height + factors[3] * mouse.dy,
        };
      },
    }));
  }

  function drawResizer(ctx: CanvasRenderingContext2D, rect: Rect) {
    ctx.fillStyle = "#BBBBBB";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  return {
    key: "resize",

    subscribe: (setRect, rect) => {
      return () => {
        const mouse = mousePosition();
        const active = activeResizer();
        if (!mouse || !active) return () => {};
        setRect((prev) => {
          return {
            ...prev,
            ...active.resize(rect),
          };
        });
      };
    },

    onExecute: (ctx, rect) => {
      getResizer(rect).forEach((box) => drawResizer(ctx, box));
    },

    onHover: (ctx, rect) => {
      getResizer(rect).forEach((box) => drawResizer(ctx, box));
    },

    shallSubscribe: (mouse, rect) => {
      return getResizer(rect).some((resizer, idx) => {
        if (positionInRect(mouse, resizer)) {
          setActiveResizer(resizer);
          return true;
        }
        return false;
      });
    },

    unSubscribe: () => {
      setActiveResizer(null);
    },
  };
}

// ctx.rect(x, y, 10, 10);
// ctx.rect(x + width / 2, y, 10, 10);
// ctx.rect(x + width, y, 10, 10);
// ctx.rect(x, y, 10, 10);
// ctx.rect(x + width / 2, y + height, 10, 10);
// ctx.rect(x + width, y + height, 10, 10);
// ctx.rect(x + width, y + height, 10, 10);
// ctx.rect(x, y + height / 2, 10, 10);
// ctx.rect(x + width, y + height + 2, 10, 10);
