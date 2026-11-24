"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { playgrounds, snippet, type Control, type Value, type Values as V } from "@/registry/playgrounds";
import { CopyButton } from "./kit/copy-button";
import { cn } from "@/lib/utils";

const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;

function Field({ control, value, onChange }: { control: Control; value: Value; onChange: (v: Value) => void }) {
  const id = useId();
  const label = <label htmlFor={id} className="text-[13px] text-neutral-700 dark:text-neutral-300">{control.label}</label>;

  switch (control.type) {
    case "number": {
      const d = decimals(control.step);
      return (
        <div>
          <div className="flex items-center justify-between gap-3">
            {label}
            <span className="font-mono text-xs text-neutral-900 dark:text-neutral-100 tabular-nums">
              {Number(value).toFixed(d)}
              {control.unit && <span className="text-neutral-500">{control.unit}</span>}
            </span>
          </div>
          <input
            id={id}
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(Number(e.target.value).toFixed(d)))}
            className="mt-2 h-1.5 w-full cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
        </div>
      );
    }
    case "boolean":
      return (
        <div className="flex items-center justify-between gap-3">
          <span id={id} className="text-[13px] text-neutral-700 dark:text-neutral-300">{control.label}</span>
          <Switch size="sm" checked={!!value} onCheckedChange={onChange} aria-labelledby={id} />
        </div>
      );
    case "select":
      return (
        <div className="space-y-2">
          {label}
          {control.options.length <= 3 && control.options.join("").length < 26 ? (
            <SegmentedControl
              aria-label={control.label}
              size="sm"
              value={String(value)}
              onValueChange={onChange}
              options={control.options.map((o) => ({ value: o, label: o }))}
              className="w-full [&>*]:flex-1"
            />
          ) : (
            <select
              id={id}
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-full rounded-lg bg-neutral-50 dark:bg-neutral-950 px-2.5 text-[13px] text-neutral-900 dark:text-neutral-100 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60"
            >
              {control.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    case "text":
      return (
        <div className="space-y-2">
          {label}
          <input
            id={id}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-lg bg-neutral-50 dark:bg-neutral-950 px-2.5 text-[13px] text-neutral-900 dark:text-neutral-100 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60"
          />
        </div>
      );
    case "color":
      return (
        <div className="space-y-2">
          <span className="text-[13px] text-neutral-700 dark:text-neutral-300">{control.label}</span>
          <div role="radiogroup" aria-label={control.label} className="flex flex-wrap gap-2">
            {control.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                aria-label={o.name}
                title={o.name}
                onClick={() => onChange(o.value)}
                className={cn(
                  "size-7 rounded-full ring-offset-2 ring-offset-neutral-100 dark:ring-offset-neutral-900 transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60",
                  value === o.value ? "ring-2 ring-neutral-950 dark:ring-neutral-50" : "ring-1 ring-neutral-950/10 dark:ring-neutral-50/10",
                )}
                style={{ background: o.value }}
              />
            ))}
          </div>
        </div>
      );
  }
}

/** Every value an component takes, as controls beside a live copy of it, and the code that matches. */
export function Values({ slug }: { slug: string }) {
  const pg = playgrounds[slug];
  const [values, setValues] = useState<V>(() => ({ ...(pg?.defaults ?? {}) }));
  if (!pg) return null;

  const dirty = JSON.stringify(values) !== JSON.stringify(pg.defaults);
  const set = (key: string) => (v: Value) => setValues((prev) => ({ ...prev, [key]: v }));
  const code = snippet(pg, values);

  return (
    <section id="values" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">Values</h2>
          <p className="mt-1.5 text-[15px] text-neutral-600 dark:text-neutral-400">Change any of them and the component answers live. The code below follows along.</p>
        </div>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => setValues({ ...pg.defaults })}
          className="flex h-9 items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 px-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] transition-colors hover:text-neutral-950 dark:hover:text-neutral-50 disabled:opacity-40"
        >
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-2xl ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="relative flex min-h-[26rem] items-center justify-center overflow-hidden bg-white dark:bg-black p-6 sm:p-10">
          <div key={pg.remount === false ? "live" : JSON.stringify(values)} className="@container relative flex w-full justify-center">
            {pg.render(values)}
          </div>
        </div>
        <div className="scrollbar-thin space-y-5 overflow-y-auto border-t border-neutral-950/[0.06] dark:border-neutral-50/[0.06] bg-neutral-100/60 dark:bg-neutral-900/60 p-5 lg:max-h-[34rem] lg:border-t-0 lg:border-l">
          {pg.controls.map((c) => (
            <Field key={c.key} control={c} value={values[c.key]} onChange={set(c.key)} />
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
        <div className="flex h-11 items-center justify-between border-b border-neutral-950/[0.06] dark:border-neutral-50/[0.06] pr-2 pl-4">
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Usage</span>
          <CopyButton value={code} />
        </div>
        <pre className="scrollbar-thin overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">{code}</pre>
      </div>
    </section>
  );
}
