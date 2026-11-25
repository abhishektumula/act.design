"use client";

import { useId, useState } from "react";
import { ChevronDown, Plus, RotateCcw, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ValueBar } from "@/components/ui/value-bar";
import { ICONS, playgrounds, snippet, type Control, type Item, type Playground, type Value, type Values as V } from "@/registry/playgrounds";
import { CopyButton } from "./kit/copy-button";
import { cn } from "@/lib/utils";

const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;

const cell =
  "relative flex h-10 min-w-0 items-center justify-between gap-3 rounded-[10px] bg-neutral-950/[0.04] px-4 text-[13px] ring-1 ring-neutral-950/[0.06] ring-inset dark:bg-neutral-50/[0.05] dark:ring-neutral-50/[0.06]";
const name = "truncate text-neutral-600 dark:text-neutral-400";
const focus = "focus-within:ring-2 focus-within:ring-blue-600/60 dark:focus-within:ring-blue-500/60";

function Field({ control, value, initial, onChange }: { control: Control; value: Value; initial: Value; onChange: (v: Value) => void }) {
  const id = useId();

  switch (control.type) {
    case "number": {
      const d = decimals(control.step);
      return (
        <ValueBar
          size="sm"
          label={control.label}
          min={control.min}
          max={control.max}
          step={control.step}
          ticks={5}
          value={Number(value)}
          defaultValue={Number(initial)}
          onValueChange={onChange}
          format={(x) => `${x.toFixed(d)}${control.unit ?? ""}`}
        />
      );
    }
    case "boolean":
      return (
        <div className={cell}>
          <span id={id} className={name}>
            {control.label}
          </span>
          <Switch size="sm" checked={!!value} onCheckedChange={onChange} aria-labelledby={id} />
        </div>
      );
    case "select":
      return (
        <label className={cn(cell, focus, "cursor-pointer hover:bg-neutral-950/[0.06] dark:hover:bg-neutral-50/[0.07]")}>
          <span className={name}>{control.label}</span>
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-neutral-950 dark:text-neutral-50">
            <span className="truncate capitalize">{String(value)}</span>
            <ChevronDown className="size-3.5 shrink-0 text-neutral-500" />
          </span>
          <select value={String(value)} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={control.label}>
            {control.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      );
    case "text":
      return (
        <div className={cn(cell, focus)}>
          <label htmlFor={id} className={cn(name, "shrink-0")}>
            {control.label}
          </label>
          <input
            id={id}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="None"
            className="min-w-0 flex-1 bg-transparent text-right font-medium text-neutral-950 outline-none placeholder:font-normal placeholder:text-neutral-400 dark:text-neutral-50 dark:placeholder:text-neutral-600"
          />
        </div>
      );
    case "color":
      return (
        <div className={cell}>
          <span className={name}>{control.label}</span>
          <div role="radiogroup" aria-label={control.label} className="flex shrink-0 items-center gap-1.5">
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
                  "size-4 rounded-full ring-offset-2 ring-offset-neutral-100 transition-[box-shadow,scale] outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:ring-offset-neutral-900 dark:focus-visible:ring-blue-500/60",
                  value === o.value ? "ring-2 ring-neutral-950 dark:ring-neutral-50" : "ring-1 ring-neutral-950/10 dark:ring-neutral-50/10",
                )}
                style={{ background: o.value }}
              />
            ))}
          </div>
        </div>
      );
    case "items":
      return <ItemsField control={control} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  }
}

/** A list of options, each a title and an icon. */
function ItemsField({ control, value, onChange }: { control: Extract<Control, { type: "items" }>; value: Item[]; onChange: (v: Item[]) => void }) {
  const edit = (i: number, patch: Partial<Item>) => onChange(value.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const names = Object.keys(ICONS);
  return (
    <div className="col-span-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">{control.label}</span>
        <button
          type="button"
          disabled={value.length >= control.max}
          onClick={() => onChange([...value, { label: `Option ${value.length + 1}`, icon: names[(value.length % (names.length - 1)) + 1] }])}
          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-950/[0.05] disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-50/[0.06]"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {value.map((it, i) => {
          const Icon = ICONS[it.icon];
          return (
            <div key={i} className={cn(cell, focus, "gap-2 pr-1.5 pl-1.5")}>
              <label className="relative grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-neutral-700 hover:bg-neutral-950/[0.06] dark:text-neutral-300 dark:hover:bg-neutral-50/[0.08]" title="Icon">
                {Icon ? <Icon className="size-4" /> : <span className="size-3 rounded-full border border-dashed border-current opacity-50" />}
                <select value={it.icon} onChange={(e) => edit(i, { icon: e.target.value })} aria-label={`Icon for option ${i + 1}`} className="absolute inset-0 cursor-pointer opacity-0">
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <input
                value={it.label}
                onChange={(e) => edit(i, { label: e.target.value })}
                aria-label={`Title for option ${i + 1}`}
                className="min-w-0 flex-1 bg-transparent font-medium text-neutral-950 outline-none dark:text-neutral-50"
              />
              <button
                type="button"
                aria-label={`Remove option ${i + 1}`}
                disabled={value.length <= control.min}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="grid size-7 shrink-0 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-950/[0.06] hover:text-neutral-950 disabled:opacity-30 dark:hover:bg-neutral-50/[0.08] dark:hover:text-neutral-50"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The values a component's playground starts from, and a setter for each. */
export function useValues(slug: string) {
  const pg = playgrounds[slug] as Playground | undefined;
  const [values, setValues] = useState<V>(() => ({ ...(pg?.defaults ?? {}) }));
  return {
    pg,
    values,
    dirty: !!pg && JSON.stringify(values) !== JSON.stringify(pg.defaults),
    set: (key: string) => (v: Value) => setValues((prev) => ({ ...prev, [key]: v })),
    reset: () => pg && setValues({ ...pg.defaults }),
  };
}

/** Every value a component takes as a grid of controls, then the code that matches. */
export function Customize({ pg, values, dirty, set, reset }: ReturnType<typeof useValues> & { pg: Playground }) {
  const code = snippet(pg, values);
  return (
    <section id="values" className="mt-4 scroll-mt-24 space-y-3">
      <div className="rounded-2xl bg-neutral-100/60 p-1.5 ring-1 ring-neutral-950/[0.06] dark:bg-neutral-900/60 dark:ring-neutral-50/[0.06]">
        <div className="flex h-11 items-center justify-between pr-1 pl-3.5">
          <h2 className="text-[15px] font-semibold text-neutral-950 dark:text-neutral-50">Customize</h2>
          <button
            type="button"
            disabled={!dirty}
            onClick={reset}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-950/[0.05] hover:text-neutral-950 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-50/[0.06] dark:hover:text-neutral-50"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>
        <div className="grid gap-2 rounded-xl bg-white p-3 ring-1 ring-neutral-950/[0.06] sm:grid-cols-2 lg:grid-cols-3 dark:bg-black dark:ring-neutral-50/[0.06]">
          {pg.controls.map((c) => (
            <Field key={c.key} control={c} value={values[c.key]} initial={pg.defaults[c.key]} onChange={set(c.key)} />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-neutral-100/60 ring-1 ring-neutral-950/[0.06] dark:bg-neutral-900/60 dark:ring-neutral-50/[0.06]">
        <div className="flex h-11 items-center justify-between border-b border-neutral-950/[0.06] pr-2 pl-4 dark:border-neutral-50/[0.06]">
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Usage</span>
          <CopyButton value={code} />
        </div>
        <pre className="scrollbar-thin overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">{code}</pre>
      </div>
    </section>
  );
}
