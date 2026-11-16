"use client";

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { Stage } from "./stage/stage";
import { Bar, Text, Window } from "./stage/window";
import { Roll } from "./stage/motion/Roll";
import type { Act } from "./stage/act";
import { Dial } from "@/components/ui/dial";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import "./hero-stage.css";

/*
 * The hero's product shot, built with the Stageshow kit: an alert rule in
 * Beacon (the uptime product the blocks are written for), tuned with the
 * library's own Dial, Switch and Button. A cursor turns the threshold up until
 * the noisy pages stop, turns paging on and saves the rule.
 */

type S = { threshold: number; oncall: boolean; saved: boolean; turning: boolean };

const initial: S = { threshold: 180, oncall: false, saved: false, turning: false };
const POSTER: S = { threshold: 320, oncall: true, saved: true, turning: false };

/** p95 latency over the last 24h, one sample every 30 minutes. */
const SERIES = [
  142, 150, 138, 161, 205, 172, 149, 140, 158, 244, 198, 151, 139, 147, 163, 188, 231, 176, 152, 141, 136, 149, 210, 168,
  150, 144, 139, 158, 196, 262, 342, 221, 164, 152, 146, 139, 151, 190, 238, 181, 157, 148, 142, 166, 214, 173, 151, 144,
];
const MAX = 400;

/** How many separate times the rule would have paged someone. */
const pages = (t: number) => SERIES.filter((v, i) => v > t && !(SERIES[i - 1] > t)).length;

function Chart({ threshold, width, height }: { threshold: number; width: number; height: number }) {
  const x = (i: number) => (i / (SERIES.length - 1)) * width;
  const y = (v: number) => height - (v / MAX) * height;
  const line = SERIES.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const ty = y(threshold);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="hs-chart" aria-hidden>
      <defs>
        <clipPath id="hs-over">
          <rect x="0" y="0" width={width} height={ty} className="hs-clip" />
        </clipPath>
        <linearGradient id="hs-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--base-50)" stopOpacity="0.07" />
          <stop offset="1" stopColor="var(--base-50)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={width} y1={height * f} y2={height * f} className="hs-grid" />
      ))}
      <path d={area} fill="url(#hs-fill)" />
      <path d={line} className="hs-line" />
      <path d={line} className="hs-line hs-line--over" clipPath="url(#hs-over)" />
      <g className="hs-threshold" style={{ transform: `translateY(${ty}px)` }}>
        <line x1="0" x2={width} y1="0" y2="0" />
      </g>
    </svg>
  );
}

async function script(a: Act<S>) {
  await a.wait(900);

  // Turn the threshold up until the noise stops paging
  await a.move("dial");
  await a.wait(250);
  await a.cursor("grab");
  await a.set({ turning: true });
  const from = a.center("dial");
  await a.drag(
    { x: from.x + 8, y: from.y - 64 },
    (at) => {
      const travel = from.y - at.y + (at.x - from.x);
      a.put({ threshold: Math.round((180 + (travel / 72) * 140) / 10) * 10 });
    },
    { duration: 1500 },
  );
  await a.set({ threshold: 320, turning: false });
  await a.cursor("pointer");
  await a.wait(700);

  // Page the on-call engineer when it does fire
  await a.click("oncall");
  await a.set({ oncall: true });
  await a.wait(600);

  // Save, and the button says so on itself
  await a.click("save");
  await a.set({ saved: true });
  await a.move("rest");
  await a.wait(2400);
}

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const useDark = () =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

export function HeroStage() {
  const dark = useDark();

  return (
    <Stage<S>
      width={720}
      height={540}
      compact={{ below: 560, width: 358, height: 470 }}
      initial={initial}
      poster={POSTER}
      script={script}
      play="once"
      theme={dark ? "dark" : "light"}
      accent="var(--signal)"
      cursor={{ at: { wide: { x: 600, y: 440 }, compact: { x: 300, y: 430 } } }}
      className="hs"
    >
      {(s, _rect, layout) => {
        const compact = layout === "compact";
        const chartW = compact ? 300 : 470;
        const count = pages(s.threshold);
        const body = (
          <div className="hs-body">
            <div className="hs-head" style={{ width: chartW }}>
              <div className="hs-title">
                <Text className="hs-name">p95 latency above threshold</Text>
                <Text className="hs-sub">checkout-api · last 24 hours</Text>
              </div>
              <span className="hs-value">
                <Roll>{`${s.threshold} ms`}</Roll>
              </span>
            </div>

            <Chart threshold={s.threshold} width={chartW} height={compact ? 112 : 132} />

            <div className="hs-controls">
              <div data-target="dial" data-cursor="grab" className="hs-dial">
                <Dial size="sm" ticks={31} label="Threshold" min={100} max={400} step={10} value={s.threshold} format={(v) => `${v} ms`} />
              </div>
              <div className="hs-side">
                <div className="hs-pages">
                  <span className="hs-pages-n" data-quiet={count <= 1 || undefined}>
                    <Roll>{`${count}×`}</Roll>
                  </span>
                  <Text className="hs-sub">pages in the last 24 hours</Text>
                </div>
                <label className="hs-row">
                  <Text className="hs-label">Page on-call</Text>
                  <span data-target="oncall" data-cursor="pointer" className="hs-switch">
                    <Switch size="sm" checked={s.oncall} aria-label="Page on-call" />
                  </span>
                </label>
                <span data-target="save" data-cursor="pointer" className="hs-save">
                  <Button tone={s.saved ? "paper" : "ink"} size="sm">
                    {s.saved && <Check />}
                    {s.saved ? "Rule saved" : "Save rule"}
                  </Button>
                </span>
              </div>
            </div>
          </div>
        );

        return (
          <>
            {compact ? (
              <Window title="Alert rules" className="hs-window" style={{ left: 20, top: 20, width: 420, height: 560 }}>
                {body}
              </Window>
            ) : (
              <Window
                title="Alert rules"
                className="hs-window"
                sidebarWidth={156}
                style={{ left: 40, top: 40, width: 1100, height: 640 }}
                sidebar={
                  <nav className="hs-nav">
                    {[56, 72, 48].map((w, i) => (
                      <span key={i} className="hs-nav-item">
                        <Bar w={12} h={12} r={3} tone={3} />
                        <Bar w={w} h={6} tone={3} />
                      </span>
                    ))}
                    <span className="hs-nav-item" data-active>
                      <Bar w={12} h={12} r={3} tone={5} />
                      <Text className="hs-nav-label">Alerts</Text>
                    </span>
                    {[64, 40].map((w, i) => (
                      <span key={i} className="hs-nav-item">
                        <Bar w={12} h={12} r={3} tone={3} />
                        <Bar w={w} h={6} tone={3} />
                      </span>
                    ))}
                  </nav>
                }
              >
                {body}
              </Window>
            )}
            <span data-target="rest" className="hs-rest" style={compact ? { left: 300, top: 430 } : { left: 600, top: 440 }} />
          </>
        );
      }}
    </Stage>
  );
}
