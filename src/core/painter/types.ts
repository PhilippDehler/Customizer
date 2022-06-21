import { Position } from "../../types";
import { NodeRect } from "../nodeRect";

export type PainterContextByKey = {
  box: { rect: NodeRect; background?: string };
  text: { rect: NodeRect; fontSize: string; text: string; color: string };
  circle: {
    rect: NodeRect;
    background: string;
    radius: number;
    strokeStyle: string;
    lineWidth: number;
  };
  document: { rect: NodeRect; background?: string };
  img: { rect: NodeRect; img: HTMLImageElement };
  line: { rect: NodeRect; points: Position[]; color: string };
  point: {
    rect: NodeRect;
    background: string;
    radius: number;
    strokeStyle: string;
    lineWidth: number;
  };
};

export type PainterKeys = keyof PainterContextByKey;
export type PainterByKey = {
  [Key in PainterKeys]: (
    canvasCtx: CanvasRenderingContext2D,
    painterCtx: PainterContextByKey[Key],
    origin: Position,
  ) => void;
};
