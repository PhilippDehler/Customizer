import { createSignal } from "solid-js";
import { Rect } from "../../types";
import { CanvasNode, createNode } from "../dom";
import { drawSrc, loadSrc } from "../domRender";

export function imageElement(src: string, parent: () => CanvasNode) {
  const [rectangle, setRectangle] = createSignal<Rect>({
    x: 300,
    y: 300,
    width: 0,
    height: 0,
    rotation: 0,
  });
  const img = loadSrc(src, setRectangle);
  return parent().addChild(
    createNode("src", {
      rect: [rectangle, setRectangle],
      render: (ctx, { node }) => {
        drawSrc(ctx, { node, src, image: img });
      },
      parent,
    })
  );
}
