import { CanvasElement, DomRender } from "./new/dom";

export type Mouse = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export type Position = { x: number; y: number };
export type Dimensions = { width: number; height: number };

export type Rotation = { rotation: number };

export type Rect = Position & Dimensions & Rotation;
