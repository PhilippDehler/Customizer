import { Node } from "../node";

export type PainterContextByKey = {
  box: { node: Node; background?: string };
  text: { node: Node; fontSize: string; text: string; color: string };
  circle: {
    node: Node;
    background: string;
    radius: number;
    strokeStyle: string;
    lineWidth: number;
  };
  document: { node: Node; background?: string };
  img: { node: Node; img: HTMLImageElement };
};

export type PainterKeys = keyof PainterContextByKey;
export type PainterByKey = {
  [Key in PainterKeys]: (
    canvasCtx: CanvasRenderingContext2D,
    painterCtx: PainterContextByKey[Key],
  ) => void;
};