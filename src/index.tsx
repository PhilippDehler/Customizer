import { render } from "solid-js/web";
import { CustomizerCanvas } from "./core/canvas";

import "./index.css";

function HelloWorld() {
  return (
    <>
      <CustomizerCanvas></CustomizerCanvas>

      {/* <ToolMenu></ToolMenu> */}
    </>
  );
}

render(() => <HelloWorld />, document.getElementById("app")!);
