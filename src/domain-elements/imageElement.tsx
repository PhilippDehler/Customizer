import { Node } from "../core/node";
import { createSignal } from "../core/signal";
import { Rect } from "../types";
import { useImageDimensions } from "../utils";

export function imageElement(src: string, parent: () => Node) {
  const [rectangle, setRectangle] = createSignal<Rect>({
    x: 300,
    y: 300,
    width: 0,
    height: 0,
    rotation: 0,
  });
  const { image, dimensions } = useImageDimensions(src);

  return Node("img", {
    getPainterCtx: (node) => ({
      img: image,
      node,
    }),
    rect: [rectangle, setRectangle],
  });
}
