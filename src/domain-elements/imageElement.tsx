import { Node } from "../core/node";
import { useImageDimensions } from "../utils";
import { dragable } from "./dragable";
import { resizable } from "./resizable";
import { able } from "./rotator";

export function imageElement(src: string, parent: () => Node) {
  const { image, dimensions } = useImageDimensions(src);
  const node = Node(
    "img",
    {
      getPainterCtx: (node) => ({
        img: image,
        rect: node.rect,
      }),
      rect: { dimensions, position: { x: 100, y: 100 }, rotation: 0 },
      dragable,

      able,
      // rotateable,
      resizable,
    },
    parent,
  );

  console.log(node.rect);
  return node;
}
