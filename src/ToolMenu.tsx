import { For } from "solid-js";

export function ToolMenu() {
  return (
    <div class="fixed bottom-4 left-4 max-w-[calc(100%-2.25rem)]">
      <div class="flex gap-10 items-center max-w-full  overflow-x-scroll">
        <For each={new Array(5)} children={() => <Tool></Tool>}></For>
      </div>
    </div>
  );
}

export function Tool() {
  return <div class="w-36 shrink-0 aspect-square border-black border-4 rounded-xl"></div>;
}
