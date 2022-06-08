import { Accessor, createSignal, Setter } from "solid-js";
import { Mouse } from "../types";
import { CanvasElement, DomElement } from "./dom";

export type Event = EventScope & EventBinding & EventLoopContext;
export type Listener = (event: Event) => void;
type EventScope = { mouse: Mouse | null };
type EventLoopContext = { stopPropagation: () => void };
type EventBinding = { element: DomElement };
const canvasEvents = ["down", "up", "move", "leave"] as const;
type CanvasEvents = "down" | "up" | "move" | "leave";

type ListenerMap = Map<
  CanvasEvents,
  Map<Listener, { listener: Listener; element: DomElement }>
>;

export type DomEvent = {
  listener: Accessor<ListenerMap>;
  addEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
  removeEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
};

export type DomEventBuilder = (self: DomElement) => DomEvent;
function getDefaultMap() {
  const x: ListenerMap = new Map();
  canvasEvents.forEach((e) => x.set(e, new Map()));
  return x;
}

function getEventBuilder(): DomEventBuilder {
  const [get, setter] = createSignal<ListenerMap>(getDefaultMap());
  return (self) => ({
    listener: get,
    addEventListener: (type, listener) => {
      setter((prev) => {
        prev.get(type)!.set(listener, { listener, element: self });
        return prev;
      });
    },
    removeEventListener: (
      type: CanvasEvents,
      listener: (event: Event) => void
    ) => {
      setter((prev) => {
        prev.get(type)?.delete(listener);
        return prev;
      });
    },
  });
}

const Observer = <T extends any, TArgs extends any[]>() => {
  let observer: Set<(...args: TArgs) => T> = new Set();
  return {
    dispatch: (...args: TArgs) => {
      observer.forEach((listener) => listener(...args));
    },
    subscribe: (listener: (...args: TArgs) => T) => {
      observer.add(listener);
    },
    unsubcribe: (listener: (...args: TArgs) => T) => {
      observer.delete(listener);
    },
  };
};

const treeForEachReverse = <T extends any>(
  node: T,
  getNextNodes: (node: T) => T[],
  fn: (node: T) => any
) => {
  const nodes = getNextNodes(node);
  for (let i = nodes.length - 1; i >= 0; i--) {
    const next = nodes[i];
    treeForEachReverse(next, getNextNodes, fn);
  }
  fn(node);
};

// function getEventExecutor(get: Accessor<ListenerMap>) {
//   return (type: CanvasEvents, scope: EventScope) => {
//     for (const { element, listener } of get().get(type)!.values()) {
//       listener({ ...scope, element, stopPropagation });
//     }
//   };
// }

// const exec = (
//   type: CanvasEvents,
//   scope: EventScope,
//   element: CanvasElement,
//   stopPropagation: () => void = () => {}
// ) => {
//   const listeners = element.listener();
//   const [propagation, setPropagation] = createSignal<boolean>(true); //#endreg
//   const sP = () =>
//     setPropagation(() => {
//       return false;
//     });
//   for (const child of element.children()) {
//     console.log(type, element.key, element.id());
//     exec(type, scope, child, sP);
//   }

//   if (!propagation()) return stopPropagation();
//   for (const { listener, element } of listeners.get(type)!.values()) {
//     listener({ ...scope, element, stopPropagation });
//   }
// };

// export const { eventBuilder, eventExecutor } = (() => {
//   return {
//     eventBuilder: getEventBuilder(),
//     eventExecutor: exec,
//   };
// })();
