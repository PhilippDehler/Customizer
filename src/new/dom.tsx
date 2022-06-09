import {
  Accessor,
  createSignal,
  createUniqueId,
  Setter,
  Signal,
} from "solid-js";
import { Rect } from "../types";
import { addDefaultEvents, buildEventSubscribers, CanvasEvent } from "./event";

export type Render<T extends NodeType> = (
  ctx: CanvasRenderingContext2D,
  renderCtx: RenderContext[T]
) => void;

export type RenderContext = {
  box: { node: CanvasNode; color: string };
  document: { node: CanvasNode };
  src: { node: CanvasNode; src: string; image?: HTMLImageElement };
  text: { node: CanvasNode; color: string };
};

export type CanvasNodeStates = {
  hover: Accessor<boolean>;
  focus: Accessor<boolean>;
};

export type CanvasNode = Node &
  CanvasEvent &
  CanvasNodeUtils & { render: Render<any> } & CanvasNodeStates;

export type Node = {
  id: () => string;
  type: string;
  parent: () => CanvasNode | null;
  rectangle: Accessor<Rect>;
  setRectangle: Setter<Rect>;
  children: Accessor<CanvasNode[]>;
};

type CanvasNodeUtils = {
  addChild: (child: CanvasNode) => CanvasNode;
  addChildren: (children: CanvasNode[]) => CanvasNode[];
  querySelector: (id: string) => CanvasNode | null;
  addAndCreateChild: <T extends NodeType>(
    type: T,
    rect: Rect | Signal<Rect>,
    render: Render<T>
  ) => CanvasNode;
};

export type NodeType = "box" | "document" | "src" | "text";

export function createNode<T extends NodeType>(
  type: T,
  {
    rect,
    parent = () => null,
    render,
  }: {
    rect: Rect | Signal<Rect>;
    parent?: () => CanvasNode | null;
    render: Render<T>;
  }
) {
  const id = createUniqueId();
  const [rectangle, setRectangle] = Array.isArray(rect)
    ? rect
    : createSignal(rect);
  const [children, setChildren] = createSignal<CanvasNode[]>([]);

  const baseNode = {
    id: () => id,
    type,
    rectangle,
    setRectangle,
    parent,
    children,
  };

  const elementEvents = buildEventSubscribers(baseNode);
  addDefaultEvents(rectangle, elementEvents);

  const self: CanvasNode = {
    render,
    ...baseNode,
    ...elementEvents,
    ...addDefaultEvents(rectangle, elementEvents),

    addAndCreateChild: (type, rect, render) => {
      return self.addChild(
        createNode(type, {
          rect,
          render,
          parent: () => self,
        })
      );
    },

    addChild: (child: CanvasNode) => {
      setChildren((prev) => [...prev, child]);
      return children().at(-1)!;
    },

    addChildren: (children: CanvasNode[]) =>
      children.map((child) => self.addChild(child)),

    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };
  return self;
}

export const clearCanvas = (ctx: CanvasRenderingContext2D) =>
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
