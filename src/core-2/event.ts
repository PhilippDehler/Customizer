import { Node } from "../core/node";
import { typesafeKeys } from "../core/ts-utils";
import { Mouse } from "../types";
import { createSignal } from "./reactive";

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
  addEventListener: (type: CanvasEvents, listener: (event: Event) => void) => void;
  removeEventListener: (type: CanvasEvents, listener: (event: Event) => void) => void;
} & SyntheticEventMap;

type MapEventNames<T extends CanvasEvents> = T extends infer CE
  ? CE extends string
    ? `on${Capitalize<CE>}`
    : never
  : never;

function initalizeListernerMap() {
  const x: ListenerMap = new Map();
  canvasEvents.forEach((e) => x.set(e, new Set()));
  return x;
}

export const createEventSystem = (): NodeEventHandlerMap => {
  const [get, set] = createSignal<ListenerMap>(initalizeListernerMap());
  const addEventListener: NodeEventHandlerMap["addEventListener"] = (type, listener) => {
    set(() => {
      const map = get().get(type);
      map?.add(listener);
      return map;
    });
  };
  return {
    dispatch: (type, scope) => {
      get()
        .get(type)!
        .forEach((listener) => listener(scope));
    },
    addEventListener,
    removeEventListener: (type: CanvasEvents, listener: (event: Event) => void) => {
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
      {} as SyntheticEventMap,
    ),
  };
};

export function dispatchEvents(
  type: CanvasEvents,
  {
    stopPropagation = () => {},

    ...args
  }: EventArgs & Partial<EventLoopContext>,
) {
  const [propagation, setPropagation] = createSignal(true);
  const children = args.target.children();
  //TODO: Capturing Phase mit einarbeiten
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

export const initalizeNodeEvents = (node: Node, events: Partial<SyntheticListenerMap> = {}) => {
  const removeOn = <T extends string>(s: `on${Capitalize<T>}`) => s.slice(2) as T;
  for (const key of typesafeKeys(events)) {
    const value = events[key];
    if (!value) continue;
    node.addEventListener(removeOn(key), value!);
  }
};
