import { Accessor } from "../core/signal";
import { Nullable, Rect } from "../types";
import { rotatePoint } from "./math-utils";

export function wrapRelativePosition(
  relativRect: Accessor<Rect>,
  getOffset?: (relativRect: () => Rect) => Nullable<Rect>,
): Accessor<Rect> {
  return () => {
    const offset = getOffset?.(relativRect) ?? {};
    const rotation = rotatePoint(
      { ...relativRect(), ...offset },
      relativRect(),
      relativRect().rotation,
    );
    return {
      ...relativRect(),
      ...offset,
      ...rotation,
    };
  };
}
