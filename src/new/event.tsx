import { Accessor, createSignal, Setter } from "solid-js";
import { Mouse } from "../types";
import { CanvasElement, DomElement } from "./dom";
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
type EventBinding = { element: DomElement };
const canvasEvents = ["down", "up", "move", "leave"] as const;
type CanvasEvents = "down" | "up" | "move" | "leave";

type ListenerMap = Map<
  CanvasEvents,
  Map<Listener, { listener: Listener; element: DomElement }>
>;

export type DomEvent = {
  dispatch: (type: CanvasEvents, scope: EventScope & EventLoopContext) => void;
  addEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
  removeEventListener: (
    type: CanvasEvents,
    listener: (event: Event) => void
  ) => void;
} & { [Key in CanvasEvents]: (listener: Listener) => void };

export type DomEventBuilder = (self: DomElement) => DomEvent;
function getDefaultMap() {
  const x: ListenerMap = new Map();
  canvasEvents.forEach((e) => x.set(e, new Map()));
  return x;
}

export const eventBuilder: DomEventBuilder = (self: DomElement) => {
  const [get, set] = createSignal<ListenerMap>(getDefaultMap());

  return {
    dispatch: (type, scope) => {
      get()
        .get(type)!
        .forEach(({ listener, element }) => listener({ ...scope, element }));
    },
    addEventListener: (type, listener) => {
      set((prev) => {
        prev.get(type)!.set(listener, { listener, element: self });
        console.log(type, get().get(type)?.entries());
        return prev;
      });
    },
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
        [`on${type}`]: (listener: Listener) => {
          set((prev) => {
            prev.get(type)!.set(listener, { listener, element: self });
            return prev;
          });
        },
      }),
      {} as { [Key in CanvasEvents]: (listener: Listener) => void }
    ),
  };
};

export function dispatchEvents(
  element: CanvasElement,
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
