import { Nullable, Rect } from "../types";
import {
  buildEventHandler,
  initalizeNodeEvents,
  NodeEventHandlerMap,
  SyntheticListenerMap,
} from "./event";
import { getPainter, PainterContextByKey, PainterKeys } from "./render";
import { Accessor, createSignal, Signal } from "./signal";
import { typesafeKeys } from "./ts-utils";
import { createUniqueId } from "./utils";

export type Node = {
  id: () => string;
  type: PainterKeys;
  rect: Signal<Rect>;
  draw: (ctx: CanvasRenderingContext2D) => void;
  children: Accessor<Node[]>;
  parent: Accessor<Node> | null;
} & NodeEventHandlerMap &
  NodeUtils;

export type NodeInit = Nullable<SyntheticListenerMap> &
  InitalNodes & {
    rect: Signal<Rect> | Rect;
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
  init: NodeInit & { getPainterCtx: (node: Node) => PainterContextByKey[T] },
  parent: (() => Node) | null = null
): Node {
  const { rect, id = createUniqueId(), getPainterCtx, ...init_ } = init;

  const rectSig = Array.isArray(rect) ? rect : createSignal(rect);
  const [children, setChildren] = createSignal<Node[]>([]);

  const self: Node = {
    id: () => id,
    type,
    draw: getPainter(type, () => getPainterCtx(self)),
    rect: rectSig,
    parent,
    children,
    ...buildEventHandler(),
    addChild: (child) => {
      setChildren((prev) => [...prev, child(() => self)]);
      return self;
    },
    addChildren: (children_) => {
      console.log(children_);
      children_(() => self).map((child) => self.addChild(() => child));
      return self;
    },
    querySelector: (id: string) => {
      if (id === self.id()) return self;
      if (!parent) return null;
      return parent()?.querySelector(id) ?? null;
    },
  };

  const { ondown, onmove, onleave, onup, ...initalNodes } = init_;
  initalizeNodes(self, initalNodes);
  initalizeNodeEvents(self, { ondown, onmove, onleave, onup });
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
