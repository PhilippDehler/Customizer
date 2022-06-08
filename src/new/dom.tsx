import {
  Accessor,
  createSignal,
  createUniqueId,
  Setter,
  Signal,
} from "solid-js";
import { Rect } from "../types";
import { positionInRect } from "../utils";
import { DomEvent, buildEventSubscribers } from "./event";

export type Render = (
  ctx: CanvasRenderingContext2D,
  canvasElement: CanvasElement
) => void;

export type CanvasElement = DomElement &
  DomEvent &
  DOMUtils & { render: Render } & {
    addAndCreateChild: (
      key: string,
      rect: Rect | Signal<Rect>,
      render: Render
    ) => CanvasElement;
    hover: Accessor<boolean>;
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
  render: Render,
  parent: () => CanvasElement | null = () => null
) {
  const [rectangle, setRectangle] = Array.isArray(rect)
    ? rect
    : createSignal(rect);
  const id = createUniqueId();
  const [children, setChildren] = createSignal<CanvasElement[]>([]);

  const domUtils: DOMUtils = {
    addChild: (child: CanvasElement) => {
      setChildren((prev) => [...prev, child]);
      return children().at(-1)!;
    },
    addChildren: (children: CanvasElement[]) =>
      children.map((child) => self.addChild(child)),
    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };

  const element = {
    id: () => id,
    key,
    rectangle,
    setRectangle,
    parent,
    children,
  };

  const elementEvents = buildEventSubscribers(element);

  const [hover, setHover] = createSignal(false);
  elementEvents.onmove((event) => {
    if (!event.mouse) return setHover(false);
    return setHover(positionInRect(event.mouse, rectangle()));
  });

  const self: CanvasElement = {
    render,
    hover,
    ...element,
    ...domUtils,
    ...elementEvents,
    ...{
      addAndCreateChild: (
        key: string,
        rect: Rect | Signal<Rect>,
        render: Render
      ) => self.addChild(createElement(key, rect, render, () => self)),
    },
  };
  return self;
}

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

type RenderType = "box" | "image";

class Node {
  id: string = createUniqueId();
  next: Node[] = [];
  children: Signal<Node[]> = createSignal([]);
  constructor(public parent: Node | null = null) {
    function a(n: Node) {
      return n;
    }
    a(this);
  }

  addChild = (child: Node) => {
    this.children[1]((prev) => [...prev, child]);
    return this.children[0]().at(-1)!;
  };

  addChildren = (children: Node[]) =>
    children.map((child) => this.addChild(child));

  querySelector = (id: string): Node | null => {
    if (id === this.id) return this;
    if (!parent) return null;
    return this.parent?.querySelector(id) ?? null;
  };
}
