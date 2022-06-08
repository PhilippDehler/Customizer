import { render } from "solid-js/web";

import "./index.css";
import { CustomizerCanvas } from "./new/CustomizerCanvas";
import { ToolMenu } from "./ToolMenu";

function HelloWorld() {
  return (
    <>
      <CustomizerCanvas></CustomizerCanvas>

      {/* <ToolMenu></ToolMenu> */}
    </>
  );
}

render(() => <HelloWorld />, document.getElementById("app")!);
