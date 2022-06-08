import { createSignal, Signal } from "solid-js";
import { Rect } from "../../types";
import { createRelativeSignal, Nullable } from "../utils";

type DOMElement = { rect: Signal<Rect>; render: () => void };

function createElement(rect: Rect | Signal<Rect>, render: () => {}) {
  const eventObserver = Observer();
  const rectSignal = Array.isArray(rect) ? rect : createSignal(rect);
  const childrenSignal = createSignal<DOMElement[]>([]);
  const isHovered = "s";
  return { rect: rectSignal, render, childrenSignal };
}

function createRelativeElement(
  calcOffset: (relativeRect: () => Rect) => Nullable<Rect>,
  render: () => {},
  element: DOMElement
) {
  const relativeSignal = createRelativeSignal(element.rect, calcOffset);
  const childrenSignal = createSignal<DOMElement[]>([]);
  return { rect: relativeSignal, render, childrenSignal };
}

const Observer = <T extends any, TArgs extends any[]>() => {
  let observer: Set<(...args: TArgs) => T> = new Set();
  return {
    dispatch: (dispatch: (...args: TArgs) => void, ...args: TArgs) => {
      observer.forEach((listener) => listener(...args));
      dispatch(...args);
    },
    subscribe: (listener: (...args: TArgs) => T) => {
      observer.add(listener);
    },
    unsubcribe: (listener: (...args: TArgs) => T) => {
      observer.delete(listener);
    },
  };
};
