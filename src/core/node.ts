import { Nullable } from "../types";
import {
  createEventSystem,
  initalizeNodeEvents,
  NodeEventHandlerMap,
  SyntheticListenerMap,
} from "./event";
import { InitalRect, NodeRect } from "./nodeRect";
import { PainterContextByKey, PainterKeys } from "./painter/types";
import { Accessor, createSignal } from "./signal";
import { typesafeKeys } from "./ts-utils";
import { createUniqueId } from "./utils";

export type Node = {
  id: () => string;
  type: PainterKeys;
  rect: NodeRect;
  children: Accessor<Node[]>;
  parent: Accessor<Node> | null;
} & NodeEventHandlerMap &
  NodeUtils &
  PainterContext<PainterKeys>;

export type PainterContext<T extends PainterKeys> = {
  getPainterCtx: (node: Node) => PainterContextByKey[T];
};

export type NodeInit = Nullable<SyntheticListenerMap> &
  InitalNodes & {
    rect: InitalRect;
    id?: string;
  };

type NodeUtils = {
  /**
   * returns self
   */
  addChild: (child: (parent: () => Node) => Node) => Node;
  /**
   * returns self
   */
  addChildren: (children: (parent: () => Node) => Node[]) => Node;
  querySelector: (id: string) => Node | null;
};

export function Node<T extends PainterKeys>(
  type: T,
  init: NodeInit & PainterContext<T>,
  parent: Accessor<Node> | null = null,
): Node {
  const { rect, id = createUniqueId(), getPainterCtx, ...init_ } = init;
  const [children, setChildren] = createSignal<Node[]>([]);
  const rect_ = NodeRect(rect, parent ? () => parent().rect : null);
  const self: Node & PainterContext<T> = {
    id: () => id,
    type,
    getPainterCtx,
    rect: rect_,
    parent,
    children,
    ...createEventSystem(),
    addChild: (child) => {
      setChildren((prev) => [...prev, child(() => self)]);
      return self;
    },
    addChildren: (children_) => {
      children_(() => self).map((child) => self.addChild(() => child));
      return self;
    },
    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };

  const { onDown, onMove, onLeave, onUp, ...initalNodes } = init_;
  initalizeNodes(self, initalNodes);
  initalizeNodeEvents(self, { onDown, onMove, onLeave, onUp });
  return self;
}

export const initalizeNodes = (node: Node, init: InitalNodes = {}) =>
  typesafeKeys(init).forEach((key) => node.addChildren(init[key]));

export type InitalNodes = {
  [Key in `${string}able`]: (parent: () => Node) => Node[];
};
// const draggable: Node[] = null as any;
// const resizeable: Node[] = null as any;

// Node("testNode", {
//   rect: { width: 20, height: 40, x: 0, y: 0, rotation: 0 },
//   ondown: (e) => {
//     console.log("down");
//   },
//   onup: (e) => {
//     console.log("up");
//   },
//   draggable,
//   resizeable,
// });
