"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = exports.ToolMenu = void 0;
const solid_js_1 = require("solid-js");
function ToolMenu() {
    return (<div class="fixed bottom-4 left-4 max-w-[calc(100%-2.25rem)]">
      <div class="flex gap-10 items-center max-w-full  overflow-x-scroll">
        <solid_js_1.For each={new Array(5)} children={() => <Tool></Tool>}></solid_js_1.For>
      </div>
    </div>);
}
exports.ToolMenu = ToolMenu;
function Tool() {
    return (<div class="w-36 shrink-0 aspect-square border-black border-4 rounded-xl"></div>);
}
exports.Tool = Tool;
