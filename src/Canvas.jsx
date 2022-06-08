"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizerCanvas = void 0;
const solid_js_1 = require("solid-js");
const rect = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};
function CustomizerCanvas() {
  const [mousePosition, setMousePosition] = (0, solid_js_1.createSignal)(null);
  const [elements, setElements] = (0, solid_js_1.createSignal)([
    { ...rect, draw: () => {} },
  ]);
  const [toDraw, setToDraw] = (0, solid_js_1.createSignal)();
  let canvas;
  (0, solid_js_1.onMount)(() => {
    const ctx = canvas?.getContext("2d");
    let frame = requestAnimationFrame(loop);
    function loop(t) {
      frame = requestAnimationFrame(loop);
      const mouse = mousePosition();
      const drawer = toDraw();
      if (!ctx || !drawer || !mouse) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elements().forEach((element) => element.draw(ctx));

      setMousePosition((prev) => (prev ? { ...prev, dx: 0, dy: 0 } : null));
    }
    (0, solid_js_1.onCleanup)(() => cancelAnimationFrame(frame));
  });
  return (
    <>
      <button
        onclick={() => {
          setElements([{ ...rect, draw: () => {} }]);
        }}
      >
        Draw
      </button>
      <canvas
        ref={canvas}
        class=" bg-slate-500"
        onpointerdown={(e) => {
          const draggable = Drag(
            () => elements()[0],
            setElements,
            mousePosition
          );
          setToDraw(draggable);
        }}
        onpointerenter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition((prev) => {
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            return {
              x,
              y,
              dx: x - (prev?.x ?? 0),
              dy: y - (prev?.y ?? 0),
            };
          });
        }}
        onpointermove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePosition((prev) => {
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            return {
              x,
              y,
              dx: x - (prev?.x ?? 0),
              dy: y - (prev?.y ?? 0),
            };
          });
        }}
        onpointerleave={(e) => {
          setMousePosition(null);
        }}
        width={1000}
        height={1000}
      ></canvas>
    </>
  );
}
