// The parts of the Stageshow kit (./stage) this site uses. Importing them from
// here rather than the kit's own index keeps the phone, iOS and messages frames,
// and their styles, out of the bundle: no page here draws a device.
export { Stage } from "./stage/stage";
export type { StageProps } from "./stage/stage";
export type { Act } from "./stage/act";
export type { Rect, Point } from "./stage/measure";
export { useReducedMotion } from "./stage/reduced-motion";
export { clock } from "./stage/clock";
export { Window, Bar, Text, Prompt, Caret } from "./stage/window";
export { Code } from "./stage/code";
export { Button } from "./stage/controls/Button";
export { Toggle } from "./stage/controls/Toggle";
export { Icon } from "./stage/parts/Icon";
