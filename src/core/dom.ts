import { Rect } from "../types";
import { Node } from "./node";
import { Signal } from "./signal";

const createDocument = (canvasRect: Signal<Rect>) => {
  return Node("document", canvasRect);
};
