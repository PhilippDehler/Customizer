import { Mouse, Nullable } from "../types";
import { Node } from "./node";
import { createSignal } from "./signal";
import { typesafeKeys } from "./ts-utils";

export type Event = EventArgs & EventLoopContext;

export type Listener = (event: Event) => void;
type EventArgs = {
  mouse: Mouse | null;
  eventId: string;
  target: Node;
};
type EventLoopContext = {
  stopPropagation: () => void;
};

export const canvasEvents = ["down", "up", "move", "leave"] as const;
export type CanvasEvents = typeof canvasEvents[number];

type ListenerMap = Map<CanvasEvents, Set<Listener>>;

export type SyntheticEventMap = {
  [Key in MapEventNames<CanvasEvents>]: (listener: Listener) => void;
};
export type SyntheticListenerMap = {
  [Key in MapEventNames<CanvasEvents>]: Listener;
};
export type NodeEventHandlerMap = {
  dispatch: (type: CanvasEvents, scope: EventArgs & EventLoopContext) => void;
  addEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
  removeEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
} & SyntheticEventMap;

type MapEventNames<T extends CanvasEvents> = T extends infer CE
  ? CE extends string
    ? `on${CE}`
    : never
  : never;

function getInitalListenerMap() {
  const x: ListenerMap = new Map();
  canvasEvents.forEach((e) => x.set(e, new Set()));
  return x;
}

export const buildEventHandler = (): NodeEventHandlerMap => {
  const [get, set] = createSignal<ListenerMap>(getInitalListenerMap());
  const addEventListener: NodeEventHandlerMap["addEventListener"] = (
    type,
    listener
  ) => {
    set((prev) => {
      prev.get(type)!.add(listener);
      return prev;
    });
  };
  return {
    dispatch: (type, scope) => {
      get()
        .get(type)!
        .forEach((listener) => listener(scope));
    },
    addEventListener,
    removeEventListener: (
      type: CanvasEvents,
      listener: (event: Event) => void
    ) => {
      set((prev) => {
        prev.get(type)?.delete(listener);
        return prev;
      });
    },
    ...canvasEvents.reduce(
      (agg, type) => ({
        ...agg,
        [`on${type}`]: (listener: Listener) => addEventListener(type, listener),
      }),
      {} as {
        [Key in MapEventNames<CanvasEvents>]: (listener: Listener) => void;
      }
    ),
  };
};

export function dispatchEvents(
  type: CanvasEvents,
  {
    stopPropagation = () => {},
    ...args
  }: EventArgs & Nullable<EventLoopContext>
) {
  const [propagation, setPropagation] = createSignal(true);
  const children = args.target.children();
  // Capturing Phase mit einarbeiten
  for (let i = children.length - 1; i >= 0; i--)
    propagation() &&
      dispatchEvents(type, {
        ...args,
        target: children[i],
        stopPropagation: () => setPropagation(() => false),
      });

  if (!propagation()) stopPropagation();
  else args.target.dispatch(type, { ...args, stopPropagation });
}

const removeOn = <T extends string>(s: `on${T}`) => s.slice(2) as T;

// export type InitalEvents = {
//   [Key in `${string}able` | CanvasEvents]?:
//     | Nullable<SyntheticListenerMap>
//     | InitalEvents;
// };

export const initalizeNodeEvents = (
  node: Node,
  events: Nullable<SyntheticListenerMap> = {}
) => {
  for (const key of typesafeKeys(events)) {
    const value = events[key];
    node.addEventListener(removeOn(key), value!);
  }
};
