"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Caret, Code, Prompt, Stage, Window, type Act } from "./kit";
import { useDark } from "./use-dark";
import "./stage-look.css";
import "./install-terminal.css";

/*
 * The closing call to action's terminal (Stageshow, chrome="terminal"; gold:
 * ruled-bento's Create tile, the card over it after overlap). Pinned bottom
 * bleed: inset a gutter from the top and sides, running off the bottom of its
 * cell. Once in view the install command types itself and the output prints;
 * in a tall cell the setup guide's next step, the cn helper, waits in a card
 * over the terminal's lower half and its lines stream in last.
 *
 * Every line is laid out from the first frame (the command as an invisible
 * ghost under what has been typed, the output reserved), so typing and
 * printing never move anything.
 */

export const INSTALL = "npm i motion lucide-react clsx tailwind-merge class-variance-authority";

const UTILS = [
  'import { clsx, type ClassValue } from "clsx";',
  'import { twMerge } from "tailwind-merge";',
  "",
  "export function cn(...inputs: ClassValue[]) {",
  "  return twMerge(clsx(inputs));",
  "}",
];

type Shell = { typed: string; done: boolean; lines: number };
const start: Shell = { typed: "", done: false, lines: 0 };
const end: Shell = { typed: INSTALL, done: true, lines: UTILS.length };

async function install(a: Act<Shell>) {
  await a.wait(600);
  await a.type("typed", INSTALL, { interval: 26 });
  await a.wait(260);
  await a.set({ done: true });
  await a.wait(1200);
  for (let n = 1; n <= UTILS.length; n++) {
    await a.set({ lines: n });
    await a.wait(UTILS[n - 1] ? 110 : 40);
  }
}

export function InstallTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 520, height: 460 });
  const dark = useDark();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setSize({ width: Math.round(node.clientWidth), height: Math.round(node.clientHeight) });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // The card needs a tall cell (the desktop layout, beside the copy). Stacked,
  // the cell is short and the terminal alone fills it, wider than tall, as a
  // still of the finished install: a short pane has no room to wait for output.
  const card = size.height >= 420 && size.width >= 480;

  return (
    <div ref={ref} className="install-terminal relative h-[240px] xl:h-auto xl:min-h-[300px] xl:flex-1">
      <Stage<Shell>
        width={size.width}
        height={size.height}
        theme={dark ? "dark" : "light"}
        initial={card ? start : end}
        poster={end}
        play="once"
        script={card ? install : undefined}
        className="it-stage look-act"
      >
        {(s) => (
          <Window chrome="terminal" lights="grey" title="app — zsh" className="it-window" body={{ className: "it-window__body" }}>
            <div className="ss-term it-body" data-done={s.done || undefined}>
              <Prompt path="~/app">
                <span className="it-cmd">
                  <span className="it-cmd__ghost" aria-hidden>
                    {INSTALL}
                  </span>
                  <span className="it-cmd__typed">
                    {s.typed}
                    {!s.done && <Caret />}
                  </span>
                </span>
              </Prompt>
              <div className="it-out" style={{ ["--i" as string]: 0 }}>
                <span className="dim">added 5 packages in 2s</span>
              </div>
              <div className="it-out" style={{ ["--i" as string]: 1 }}>
                <span className="dim">found</span> <span className="ok">0</span> <span className="dim">vulnerabilities</span>
              </div>
              <Prompt path="~/app" className="it-out" style={{ ["--i" as string]: 2 }}>
                <Caret />
              </Prompt>
            </div>
            {card && (
              <div className="it-card">
                <div className="it-card__head">
                  <span>lib/utils.ts</span>
                </div>
                <Code lines={UTILS} count={s.lines} className="it-code" />
              </div>
            )}
          </Window>
        )}
      </Stage>
    </div>
  );
}
