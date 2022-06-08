"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_1 = require("solid-js/web");
const Canvas_1 = require("./Canvas");
require("./index.css");
function HelloWorld() {
    return (<>
      <Canvas_1.CustomizerCanvas></Canvas_1.CustomizerCanvas>

      {/* <ToolMenu></ToolMenu> */}
    </>);
}
(0, web_1.render)(() => <HelloWorld />, document.getElementById("app"));
