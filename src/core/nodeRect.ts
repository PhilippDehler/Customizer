import { Dimensions, Position } from "../types";
import { add, rotatePoint } from "../utils/math-utils";
import { createObservableSignal, ObserveredSignal } from "./signal";

export type NodeRectSnapshot = {
  position: Position;
  dimensions: Dimensions;
  rotation: number;
  center: Position;
  absoluteRotation: number;
};
type NodeRectKeys = keyof NodeRectSnapshot;

export type InitalRect = {
  [key in Exclude<NodeRectKeys, "center" | "absoluteRotation">]:
    | NodeRectSnapshot[key]
    | ObserveredSignal<NodeRectSnapshot[key]>;
};

export type NodeRect = {
  [key in NodeRectKeys]: ObserveredSignal<NodeRectSnapshot[key]>;
} & {
  getSnapshot: () => NodeRectSnapshot;
  getParentRect: (() => NodeRect) | null;
  getCanvasCoordinate: (position?: Position) => Position;
};

export function NodeRect(init: InitalRect, getParentRect: (() => NodeRect) | null) {
  console.log("NodeRect");
  const createObservable = <T>(value: T | ObserveredSignal<T>): ObserveredSignal<T> => {
    if (typeof value === "object" && "observe" in value)
      return value as unknown as ObserveredSignal<T>;
    else return createObservableSignal(value);
  };
  const center = createObservableSignal(
    getParentRect
      ? add(getParentRect().center.value(), getParentRect().position.value())
      : {
          x: 0,
          y: 0,
        },
  );
  const rotation = createObservable(init.rotation);

  const absoluteRotation = createObservableSignal(
    getParentRect ? getParentRect().absoluteRotation.value() + rotation.value() : rotation.value(),
  );

  const rect: Omit<NodeRect, "rotationStack"> = {
    center,
    absoluteRotation,
    rotation,
    dimensions: createObservable(init.dimensions),
    position: createObservable(init.position),
    getSnapshot: () => ({
      absoluteRotation: rect.absoluteRotation.value(),
      dimensions: rect.dimensions.value(),
      rotation: rect.rotation.value(),
      center: rect.center.value(),
      position: rect.position.value(),
    }),
    getParentRect,
    getCanvasCoordinate: (pos = { x: 0, y: 0 }) => {
      const center = rect.center.value();
      const translatedPosition = add(rect.position.value(), center);
      const absoluteRotation = rect.absoluteRotation.value();
      return rotatePoint(add(translatedPosition, pos), center, absoluteRotation);
    },
  };

  // forward kinematics observer
  getParentRect?.().position.observe((position) => {
    rect.center.setValue(add(position, getParentRect?.().center.value()));
  });

  getParentRect?.().center.observe((center) => {
    rect.center.setValue(add(center, getParentRect().position.value()));
  });
  getParentRect?.().center.observe((center) => {
    rect.center.setValue(add(center, getParentRect().position.value()));
  });
  getParentRect?.().absoluteRotation.observe((rotation) => {
    rect.absoluteRotation.setValue(rotation + rect.rotation.value());
  });

  rect.rotation.observe((rotation) => {
    rect.absoluteRotation.setValue(
      getParentRect
        ? (getParentRect().absoluteRotation.value() + rotation) % (Math.PI * 2)
        : rotation,
    );
  });

  // parentRect?.rotation.observe((rotation) => rect.rotation.setValue(rotation));
  // parentRect?.rotation.observe((rotation, prevRotation) => {
  //   rect.position.setValue((pos) =>
  //     rotatePoint(rotatePoint(pos, { x: 0, y: 0 }, -prevRotation), { x: 0, y: 0 }, rotation),
  //   );
  // });

  return rect;
}
