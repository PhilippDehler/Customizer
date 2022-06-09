import { Accessor, createSignal } from "solid-js";
import { Mouse, Rect } from "../types";
import { positionInRect } from "../utils";
import { CanvasNode, Node } from "./dom";
import { Nullable } from "./utils";

export type Event = EventScope & EventBinding & EventLoopContext;

export type Listener = (event: Event) => void;
type EventScope = {
  mouse: Mouse | null;
  eventId: string;
};
type EventLoopContext = {
  stopPropagation: () => void;
};
type EventBinding = { element: Node };
const canvasEvents = ["down", "up", "move", "leave"] as const;
type CanvasEvents = typeof canvasEvents[number];

type ListenerMap = Map<
  CanvasEvents,
  Map<Listener, { listener: Listener; element: Node }>
>;

export type CanvasEvent = {
  dispatch: (type: CanvasEvents, scope: EventScope & EventLoopContext) => void;
  addEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
  removeEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
} & { [Key in MapNames<CanvasEvents>]: (listener: Listener) => void };

type MapNames<T extends CanvasEvents> = T extends infer CE
  ? CE extends string
    ? `on${CE}`
    : never
  : never;

export type DomEventBuilder = (self: Node) => CanvasEvent;

function getInitalListenerMap() {
  const x: ListenerMap = new Map();
  canvasEvents.forEach((e) => x.set(e, new Map()));
  return x;
}

export const buildEventSubscribers: DomEventBuilder = (self: Node) => {
  const [get, set] = createSignal<ListenerMap>(getInitalListenerMap());
  const addEventListener: CanvasEvent["addEventListener"] = (
    type,
    listener
  ) => {
    set((prev) => {
      prev.get(type)!.set(listener, { listener, element: self });
      console.log(type, get().get(type)?.entries());
      return prev;
    });
  };
  return {
    dispatch: (type, scope) => {
      get()
        .get(type)!
        .forEach(({ listener, element }) => listener({ ...scope, element }));
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
      {} as { [Key in MapNames<CanvasEvents>]: (listener: Listener) => void }
    ),
  };
};

export function dispatchEvents(
  element: CanvasNode,
  type: CanvasEvents,
  {
    stopPropagation = () => {},
    ...scope
  }: EventScope & Nullable<EventLoopContext>
) {
  const [propagation, setPropagation] = createSignal(true);
  const children = element.children();
  for (let i = children.length - 1; i >= 0; i--)
    propagation() &&
      dispatchEvents(children[i], type, {
        ...scope,
        stopPropagation: () => setPropagation(() => false),
      });

  if (!propagation()) stopPropagation();
  else element.dispatch(type, { ...scope, stopPropagation });
}

export function addDefaultEvents(
  rect: Accessor<Rect>,
  eventHandler: CanvasEvent
) {
  const [hover, setHover] = createSignal(false);
  eventHandler.onmove((event) => {
    if (!event.mouse) return setHover(false);
    return setHover(positionInRect(event.mouse, rect()));
  });
  const [focusState, setFocusState] = createSignal<
    "hovered" | "focus" | "not-focused"
  >("not-focused");
  eventHandler.ondown(() => {
    if (hover()) return setFocusState("hovered");
    else setFocusState("not-focused");
  });
  eventHandler.onup((e) => {
    if (hover() || e.element.children().some((child) => child.focus()))
      return setFocusState("focus");
    else setFocusState("not-focused");
  });
  return { focus: () => focusState() === "focus", hover };
}
