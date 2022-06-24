import { assertNever } from "../utils";

type ReactiveContext = {
  subscriberContext: Subscriber | null;
  status: "IDLE" | "BATCH_CONTEXT";
  defferedSubscribers: Set<Subscriber>;
};

let reactiveContext: ReactiveContext = {
  subscriberContext: null,
  status: "IDLE",
  defferedSubscribers: new Set(),
};

export type Subscriber = () => void;
export type Setter<T> = (setFn: (previous: T) => T) => void;
export type Getter<T> = () => T;
type Signal<T> = [getter: Getter<T>, setter: Setter<T>];

export function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers: Set<Subscriber> = new Set();

  const get = () => {
    if (reactiveContext.subscriberContext) subscribers.add(reactiveContext.subscriberContext);
    return value;
  };
  const set = (newValue: T) => {
    switch (reactiveContext.status) {
      case "IDLE":
        subscribers.forEach((subscriber) => subscriber());
        return newValue;
      case "BATCH_CONTEXT":
        subscribers.forEach((subscriber) => reactiveContext.defferedSubscribers.add(subscriber));
        return newValue;
      default:
        return assertNever(reactiveContext.status);
    }
  };
  return [
    get,
    (easySet) => {
      return set(easySet(value));
    },
  ];
}

export function batch(fn: Subscriber) {
  reactiveContext.status = "BATCH_CONTEXT";
  fn();
  reactiveContext.defferedSubscribers.forEach((subscriber) => subscriber());
  reactiveContext.defferedSubscribers.clear();
  reactiveContext.status = "IDLE";
}

export function untrack(fn: Subscriber): void {
  const outerContext = reactiveContext.subscriberContext;
  reactiveContext.subscriberContext = null;
  fn();
  reactiveContext.subscriberContext = outerContext;
}

export function createEffect(fn: Subscriber) {
  const execute = () => {
    const outerContext = reactiveContext.subscriberContext;
    reactiveContext.subscriberContext = execute;
    fn();
    reactiveContext.subscriberContext = outerContext;
  };
  execute();
}

export function memo<T>(fn: () => T) {
  const [get, set] = createSignal<T>(fn());
  const execute = () => {
    const outerContext = reactiveContext.subscriberContext;
    reactiveContext.subscriberContext = execute;
    reactiveContext.subscriberContext = outerContext;
    set(fn);
  };
  return get;
}
