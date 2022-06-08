import { Accessor, createSignal, Setter } from "solid-js";
import { Mouse } from "../types";
import { CanvasElement, DomElement } from "./dom";

export type Event = EventScope & EventBinding;
export type Listener = (event: Event) => void;
type EventScope = { mouse: Mouse | null };
type EventBinding = { element: DomElement };
const canvasEvents = ["down", "up", "move", "leave"] as const;
type CanvasEvents = "down" | "up" | "move" | "leave";

type ListenerMap = Map<
  CanvasEvents,
  Map<Listener, { listener: Listener; element: DomElement }>
>;

export type DomEvent = {
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

function getEventBuilder(setter: Setter<ListenerMap>): DomEventBuilder {
  return (self) => ({
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

function getEventExecutor(get: Accessor<ListenerMap>) {
  return (type: CanvasEvents, scope: EventScope) => {
    for (const { element, listener } of get().get(type)!.values()) {
      listener({ ...scope, element });
    }
  };
}

export const { eventBuilder, eventExecutor } = (() => {
  const [get, set] = createSignal<ListenerMap>(getDefaultMap());
  return {
    eventBuilder: getEventBuilder(set),
    eventExecutor: getEventExecutor(get),
  };
})();
