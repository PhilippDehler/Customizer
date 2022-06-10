import { omit } from "lodash";
import { Nullable, Rect } from "../types";
import {
  buildEventHandler,
  canvasEvents,
  initalizeNodeEvents,
  NodeEventHandlerMap,
  SyntheticEventMap,
} from "./event";
import { Accessor, createSignal, Setter, Signal } from "./signal";
import { typesafeKeys } from "./ts-utils";
import { createUniqueId } from "./utils";

export type Node = {
  id: () => string;
  type: string;
  rectangle: Accessor<Rect>;
  setRectangle: Setter<Rect>;
  children: Accessor<Node[]>;
  parent: Accessor<Node> | null;
} & NodeEventHandlerMap &
  NodeUtils;

type NodeUtils = {
  addChild: (child: Node) => Node;
  addChildren: (children: Node[]) => Node[];
  querySelector: (id: string) => Node | null;
  addAndCreateChild: (
    type: string,
    rect: Rect | Signal<Rect>,
    build: NodeBuilder
  ) => Node;
};

type NodeBuilder = (node: Node) => Nullable<SyntheticEventMap> & InitalNodes;

export function Node(
  type: string,
  rect: Rect | Signal<Rect>,
  build: NodeBuilder = () => ({}),
  parent: (() => Node) | null = null
): Node {
  const id = createUniqueId();
  const [rectangle, setRectangle] = Array.isArray(rect)
    ? rect
    : createSignal(rect);
  const [children, setChildren] = createSignal<Node[]>([]);

  const self: Node = {
    id: () => id,
    type,
    rectangle,
    setRectangle,
    parent,
    children,
    ...buildEventHandler(),
    addAndCreateChild: (type, rect, build) => {
      return self.addChild(Node(type, rect, build, () => self));
    },
    addChild: (child) => {
      setChildren((prev) => [...prev, child]);
      return children().at(-1)!;
    },
    addChildren: (children) => children.map((child) => self.addChild(child)),
    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };
  const built = build(self);

  const initalEvents = omit(built, canvasEvents);
  initalizeNodes(self, initalEvents);
  initalizeNodeEvents(self, initalEvents);
  return self;
}

export const initalizeNodes = (node: Node, init: InitalNodes = {}) => {
  for (const key of typesafeKeys(init)) {
    const nodes = init[key]!;
    if (!("nodes" in init)) continue;
    node.addChildren(nodes);
  }
};

export type InitalNodes = {
  [Key in `${string}able`]?: Node[];
};
