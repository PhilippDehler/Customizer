import { Node } from "../new/dom";
import { treeForEach } from "./tree-utils";

export const render = (ctx: CanvasRenderingContext2D, node: Node) =>
  treeForEach(
    node,
    (node) => node.children(),
    (n) => n.c(ctx)
  );
