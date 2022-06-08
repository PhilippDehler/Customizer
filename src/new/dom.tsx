import {
  Accessor,
  createSignal,
  createUniqueId,
  Setter,
  Signal,
} from "solid-js";
import { Rect } from "../types";
import { DomEvent, eventBuilder } from "./event";
export type DomRender = (
  ctx: CanvasRenderingContext2D,
  canvasElement: CanvasElement
) => void;

export type CanvasElement = DomElement &
  DomEvent &
  DOMUtils & { render: DomRender } & {
    addAndCreateChild: (
      key: string,
      rect: Rect | Signal<Rect>,
      render: DomRender
    ) => CanvasElement;
  };
export type DomElement = {
  id: () => string;
  key: string;
  parent: () => CanvasElement | null;
  rectangle: Accessor<Rect>;
  setRectangle: Setter<Rect>;
  children: Accessor<CanvasElement[]>;
};

type DOMUtils = {
  addChild: (child: CanvasElement) => CanvasElement;
  addChildren: (children: CanvasElement[]) => CanvasElement[];
  querySelector: (id: string) => CanvasElement | null;
};

export function createElement(
  key: string,
  rect: Rect | Signal<Rect>,
  render: DomRender,
  parent: () => CanvasElement | null = () => null
) {
  const [rectangle, setRectangle] = Array.isArray(rect)
    ? rect
    : createSignal(rect);
  const id = createUniqueId();
  const [children, setChildren] = createSignal<CanvasElement[]>([]);

  const domUtils: DOMUtils = {
    addChild: (child: CanvasElement) => {
      const prevLength = children().length;
      setChildren((prev) => [...prev, child]);
      return children()[prevLength];
    },
    addChildren: (children: CanvasElement[]) =>
      children.map((child) => self.addChild(child)),
    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };

  const domElement = {
    id: () => id,
    key,
    rectangle,
    setRectangle,
    parent,
    children,
  };

  const domEvents = eventBuilder(domElement);

  const self: CanvasElement = {
    render,
    ...domElement,
    ...domUtils,
    ...domEvents,
    ...{
      addAndCreateChild: (
        key: string,
        rect: Rect | Signal<Rect>,
        render: DomRender
      ) => self.addChild(createElement(key, rect, render, () => self)),
    },
  };
  return self;
}

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const domRenderer = (
  ctx: CanvasRenderingContext2D,
  canvasElement: CanvasElement
) => {
  canvasElement.render(ctx, canvasElement);
  canvasElement.children().forEach((child) => domRenderer(ctx, child));
};
