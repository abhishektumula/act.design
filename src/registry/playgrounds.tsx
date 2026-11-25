"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, CreditCard, FilePlus2, Image, Kanban, LayoutDashboard, LayoutGrid, List, Monitor, Moon, Music, Rows3, Settings, Sun, Table2, Trash2, UserPlus, Video, type LucideIcon } from "lucide-react";
import { Burst } from "@/components/ui/burst";
import { Button } from "@/components/ui/button";
import { CardStack } from "@/components/ui/card-stack";
import { CodeInput } from "@/components/ui/code-input";
import { CommandPalette, type Command } from "@/components/ui/command-palette";
import { CompareSlider } from "@/components/ui/compare-slider";
import { Dial } from "@/components/ui/dial";
import { DialGallery, type DialGalleryItem, type DialGalleryReveal } from "@/components/ui/dial-gallery";
import { Fader } from "@/components/ui/fader";
import { DriftCanvas } from "@/components/ui/drift-canvas";
import { FocusCanvas } from "@/components/ui/focus-canvas";
import { FolderCard } from "@/components/ui/folder-card";
import { HoldToConfirm } from "@/components/ui/hold-to-confirm";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { LayerText } from "@/components/ui/layer-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Orb, orbPalettes, type OrbPalette, type OrbState, type OrbVariant } from "@/components/ui/orb";
import { PromptInput } from "@/components/ui/prompt-input";
import { PruneReveal } from "@/components/ui/prune-reveal-animation";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { TextFocus } from "@/components/ui/text-focus";
import { Typeset } from "@/components/ui/typeset";
import { TrashBin } from "@/components/ui/trash-bin";
import { ValueBar } from "@/components/ui/value-bar";

/* --------------------------------- schema --------------------------------- */

/** One row of an `items` control: a title and the name of an icon from `ICONS`. */
export type Item = { label: string; icon: string };
export type Value = string | number | boolean | Item[];
export type Values = Record<string, Value>;

export type Control =
  | { type: "number"; key: string; label: string; min: number; max: number; step: number; unit?: string }
  | { type: "boolean"; key: string; label: string }
  | { type: "select"; key: string; label: string; options: string[] }
  | { type: "text"; key: string; label: string }
  | { type: "color"; key: string; label: string; options: { name: string; value: string }[] }
  | { type: "items"; key: string; label: string; min: number; max: number };

export type Playground = {
  /** The named export, as it appears in the snippet. */
  component: string;
  controls: Control[];
  defaults: Values;
  render: (v: Values) => ReactNode;
  /** Rebuild the component when a value changes, for props it only reads on mount. Default true. */
  remount?: boolean;
  /** Which values the snippet leaves out, or a custom snippet. */
  code?: (v: Values) => string;
};

/* Tailwind palette colours offered wherever a component takes a colour. */
const COLORS = [
  { name: "Signal", value: "var(--color-blue-500)" },
  { name: "Sky", value: "var(--color-sky-500)" },
  { name: "Emerald", value: "var(--color-emerald-500)" },
  { name: "Violet", value: "var(--color-violet-500)" },
  { name: "Rose", value: "var(--color-rose-500)" },
  { name: "Neutral", value: "var(--color-neutral-500)" },
];

const STREAKS = [
  { name: "Amber", value: "var(--color-amber-400)" },
  { name: "Red", value: "var(--color-red-500)" },
  { name: "Sky", value: "var(--color-sky-400)" },
  { name: "Ink", value: "currentColor" },
];

const n = (v: Value) => Number(v);
const str = (v: Value) => String(v);
const list = (v: Value) =>
  String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* ------------------------------- stateful bits ------------------------------ */

function PaletteDemo({ hotkey, placeholder }: { hotkey: string; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const commands: Command[] = [
    { id: "dash", label: "Go to Dashboard", group: "Navigation", icon: LayoutDashboard, shortcut: ["G", "D"] },
    { id: "settings", label: "Open Settings", group: "Navigation", icon: Settings },
    { id: "billing", label: "Billing", group: "Navigation", icon: CreditCard },
    { id: "new", label: "New document", group: "Actions", icon: FilePlus2 },
    { id: "invite", label: "Invite teammate", group: "Actions", icon: UserPlus },
    { id: "theme", label: "Toggle theme", group: "Actions", icon: Moon },
  ];
  return (
    <>
      <Button tone="paper" onClick={() => setOpen(true)}>
        Open palette <span className="text-neutral-500">⌘{hotkey.toUpperCase()}</span>
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} hotkey={hotkey} placeholder={placeholder} />
    </>
  );
}

const PHOTOS: Record<string, { src: string; prompt: string }> = {
  Skyline: { prompt: "A city skyline at dusk under heavy storm clouds", src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  Lagoon: { prompt: "Palm fronds framing a still lagoon at sunset", src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  Breakwater: { prompt: "A stone breakwater running out into a stormy sea", src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
};

function PruneDemo({ photo, duration, wait }: { photo: string; duration: number; wait: number }) {
  const shot = PHOTOS[photo] ?? PHOTOS.Skyline;
  const [src, setSrc] = useState<string | undefined>();
  const timer = useRef(0);
  const run = () => {
    window.clearTimeout(timer.current);
    setSrc(undefined);
    timer.current = window.setTimeout(() => setSrc(shot.src), wait);
  };
  // It starts empty, so on mount only the image's arrival needs scheduling.
  useEffect(() => {
    timer.current = window.setTimeout(() => setSrc(shot.src), wait);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <PruneReveal src={src} alt={shot.prompt} prompt={shot.prompt} duration={duration} />
      <Button tone="paper" size="sm" onClick={run}>
        Generate again
      </Button>
    </div>
  );
}

const GALLERY: DialGalleryItem[] = [
  { label: "Moonrise", caption: "Open water", src: "https://images.unsplash.com/photo-1792802992164-c43f3b404891?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  { label: "Spire", caption: "Manhattan", src: "https://images.unsplash.com/photo-1795337259685-2865d38f0e44?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  { label: "Haze", caption: "Bangkok", src: "https://images.unsplash.com/photo-1795412288110-4669a977d984?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
  { label: "Waterfall", caption: "Columbia Gorge", src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=987&auto=format&fit=crop" },
  { label: "Summit", caption: "Swiss Alps", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop" },
  { label: "Angles", caption: "Cleveland", src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1200&auto=format&fit=crop" },
  { label: "Highlands", caption: "Isle of Skye", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop" },
  { label: "Towers", caption: "City centre", src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop" },
];
const IMAGES = Object.entries(PHOTOS).map(([name, p]) => ({ src: p.src, alt: name }));
function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className="size-full rounded-2xl object-cover shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10" />;
}
const STACK = ["bg-blue-600 text-white", "bg-neutral-800 text-white", "bg-sky-400 text-sky-950", "bg-neutral-200 text-neutral-900", "bg-blue-950 text-blue-100", "bg-neutral-500 text-white", "bg-sky-700 text-white", "bg-neutral-950 text-white"];
/** Icons an `items` control can pick from. "None" leaves the option without one. */
export const ICONS: Record<string, LucideIcon | null> = { None: null, List, Kanban, CalendarDays, Rows3, Table2, LayoutGrid, Image, Video, Music, Sun, Moon, Monitor };
const items = (v: Value) => (Array.isArray(v) ? v : []);
const slugify = (s: string, i: number) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `option-${i + 1}`;

/* Things to put either side of a compare slider. */
function MockCard({ dark }: { dark?: boolean }) {
  return (
    <div className={`absolute inset-0 grid place-items-center ${dark ? "bg-neutral-900" : "bg-neutral-100"}`}>
      <div className={`w-3/5 max-w-64 rounded-2xl p-5 ring-1 ${dark ? "bg-neutral-800 ring-white/10" : "bg-white shadow-lg ring-black/5"}`}>
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-full bg-linear-to-br from-sky-400 to-blue-600" />
          <span className="flex-1 space-y-1.5">
            <span className={`block h-2 w-3/4 rounded-full ${dark ? "bg-neutral-600" : "bg-neutral-300"}`} />
            <span className={`block h-2 w-1/2 rounded-full ${dark ? "bg-neutral-700" : "bg-neutral-200"}`} />
          </span>
        </div>
        <span className={`mt-5 block h-16 rounded-lg ${dark ? "bg-neutral-700/60" : "bg-neutral-100"}`} />
        <span className="mt-4 flex justify-end">
          <span className={`h-7 w-20 rounded-lg ${dark ? "bg-neutral-50" : "bg-neutral-950"}`} />
        </span>
      </div>
    </div>
  );
}
const photo = "absolute inset-0 size-full object-cover";
const SIDES: Record<string, ReactNode> = {
  /* eslint-disable @next/next/no-img-element */
  "Skyline · mono": <img src={PHOTOS.Skyline.src} alt="" draggable={false} className={`${photo} grayscale`} />,
  Skyline: <img src={PHOTOS.Skyline.src} alt="" draggable={false} className={photo} />,
  Lagoon: <img src={PHOTOS.Lagoon.src} alt="" draggable={false} className={photo} />,
  Breakwater: <img src={PHOTOS.Breakwater.src} alt="" draggable={false} className={photo} />,
  /* eslint-enable @next/next/no-img-element */
  "Card · light": <MockCard />,
  "Card · dark": <MockCard dark />,
};

/* ------------------------------- playgrounds ------------------------------- */

export const playgrounds: Record<string, Playground> = {
  dial: {
    component: "Dial",
    controls: [
      { type: "text", key: "label", label: "Label" },
      { type: "number", key: "min", label: "Min", min: -100, max: 0, step: 5 },
      { type: "number", key: "max", label: "Max", min: 10, max: 200, step: 5 },
      { type: "number", key: "step", label: "Step", min: 1, max: 20, step: 1 },
      { type: "number", key: "ticks", label: "Ticks", min: 11, max: 81, step: 2 },
      { type: "number", key: "defaultValue", label: "Start at", min: -100, max: 200, step: 1 },
      { type: "select", key: "size", label: "Size", options: ["sm", "md", "lg"] },
      { type: "select", key: "tone", label: "Tone", options: ["signal", "level"] },
      { type: "number", key: "danger", label: "Danger from", min: -100, max: 200, step: 1 },
    ],
    defaults: { label: "Gain", min: 0, max: 100, step: 1, ticks: 41, defaultValue: 50, size: "md", tone: "level", danger: 85 },
    render: (v) => (
      <Dial
        label={str(v.label)}
        min={n(v.min)}
        max={n(v.max)}
        step={n(v.step)}
        ticks={n(v.ticks)}
        defaultValue={n(v.defaultValue)}
        size={str(v.size) as "sm" | "md" | "lg"}
        tone={str(v.tone) as "signal" | "level"}
        danger={n(v.danger)}
      />
    ),
    code: (v) =>
      `<Dial\n  label="${v.label}"\n  min={${v.min}}\n  max={${v.max}}\n  defaultValue={${v.defaultValue}}${v.tone === "level" ? `\n  tone="level"\n  danger={${v.danger}}` : ""}\n/>`,
  },
  "dial-gallery": {
    component: "DialGallery",
    controls: [
      { type: "select", key: "reveal", label: "Reveal", options: ["iris", "wipe", "fade"] },
      { type: "select", key: "side", label: "Image side", options: ["right", "left"] },
      { type: "number", key: "depth", label: "Depth blur", min: 0, max: 2, step: 0.1 },
      { type: "number", key: "defaultValue", label: "Start at", min: 0, max: 7, step: 1 },
      { type: "boolean", key: "brackets", label: "Brackets" },
      { type: "number", key: "spacing", label: "Spacing", min: 1.4, max: 3.2, step: 0.1, unit: "×" },
      { type: "color", key: "accent", label: "Brackets", options: COLORS },
    ],
    defaults: { reveal: "iris", side: "right", depth: 1, spacing: 2, defaultValue: 1, brackets: true, accent: "var(--color-blue-500)" },
    render: (v) => (
      <DialGallery
        items={GALLERY}
        reveal={str(v.reveal) as DialGalleryReveal}
        side={str(v.side) as "left" | "right"}
        depth={n(v.depth)}
        defaultValue={n(v.defaultValue)}
        brackets={!!v.brackets}
        spacing={n(v.spacing)}
        accent={str(v.accent)}
        className="h-[clamp(17rem,calc(75cqw-10rem),30rem)] max-w-3xl"
      />
    ),
    code: (v) =>
      `<DialGallery\n  items={photos}\n  reveal="${v.reveal}"\n  side="${v.side}"\n  depth={${v.depth}}\n  spacing={${v.spacing}}\n  defaultValue={${v.defaultValue}}${v.brackets ? "" : "\n  brackets={false}"}\n  accent="${v.accent}"\n/>`,
  },
  fader: {
    component: "Fader",
    controls: [
      { type: "text", key: "label", label: "Label" },
      { type: "number", key: "min", label: "Min", min: 0, max: 50, step: 1 },
      { type: "number", key: "max", label: "Max", min: 60, max: 200, step: 5 },
      { type: "number", key: "step", label: "Step", min: 1, max: 10, step: 1 },
      { type: "number", key: "ticks", label: "Ticks", min: 11, max: 81, step: 2 },
      { type: "number", key: "defaultValue", label: "Start at", min: 0, max: 200, step: 1 },
      { type: "text", key: "marks", label: "Marks" },
      { type: "color", key: "accent", label: "Accent", options: COLORS },
    ],
    defaults: { label: "Focus", min: 0, max: 100, step: 1, ticks: 41, defaultValue: 62, marks: "Soft, Sharp", accent: "var(--color-blue-500)" },
    render: (v) => (
      <div className="w-full max-w-sm">
        <Fader label={str(v.label)} min={n(v.min)} max={n(v.max)} step={n(v.step)} ticks={n(v.ticks)} defaultValue={n(v.defaultValue)} marks={list(v.marks)} accent={str(v.accent)} />
      </div>
    ),
    code: (v) =>
      `<Fader\n  label="${v.label}"\n  min={${v.min}}\n  max={${v.max}}\n  step={${v.step}}\n  ticks={${v.ticks}}\n  defaultValue={${v.defaultValue}}\n  marks={${JSON.stringify(list(v.marks))}}\n  accent="${v.accent}"\n/>`,
  },
  "value-bar": {
    component: "ValueBar",
    controls: [
      { type: "text", key: "label", label: "Label" },
      { type: "select", key: "size", label: "Size", options: ["sm", "md", "lg"] },
      { type: "number", key: "min", label: "Min", min: 0, max: 50, step: 1 },
      { type: "number", key: "max", label: "Max", min: 1, max: 200, step: 1 },
      { type: "number", key: "step", label: "Step", min: 1, max: 20, step: 1 },
      { type: "number", key: "defaultValue", label: "Start at", min: 0, max: 200, step: 1 },
      { type: "number", key: "ticks", label: "Ticks", min: 0, max: 24, step: 1 },
      { type: "text", key: "suffix", label: "Suffix" },
      { type: "text", key: "levels", label: "Levels" },
      { type: "color", key: "accent", label: "Accent", options: [{ name: "Neutral", value: "var(--color-neutral-500)" }, ...COLORS.filter((c) => c.name !== "Neutral")] },
      { type: "boolean", key: "hideValue", label: "Hide value" },
      { type: "boolean", key: "disabled", label: "Disabled" },
    ],
    defaults: { label: "Strength", size: "lg", min: 0, max: 9, step: 1, defaultValue: 3, ticks: 9, suffix: "", levels: "Off, Low, Medium, High, Max", accent: "var(--color-neutral-500)", hideValue: false, disabled: false },
    render: (v) => (
      <div className="w-full max-w-md">
        <ValueBar
          label={str(v.label)}
          size={str(v.size) as "sm" | "md" | "lg"}
          min={n(v.min)}
          max={Math.max(n(v.min) + 1, n(v.max))}
          step={n(v.step)}
          defaultValue={n(v.defaultValue)}
          ticks={n(v.ticks)}
          format={(x) => `${x}${str(v.suffix)}`}
          levels={list(v.levels).length ? list(v.levels) : undefined}
          accent={str(v.accent)}
          hideValue={!!v.hideValue}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: (v) => {
      const lv = list(v.levels);
      return `<ValueBar\n  label="${v.label}"\n  size="${v.size}"\n  min={${v.min}}\n  max={${v.max}}\n  step={${v.step}}\n  defaultValue={${v.defaultValue}}\n  ticks={${v.ticks}}${v.suffix ? `\n  format={(v) => \`\${v}${v.suffix}\`}` : ""}${lv.length ? `\n  levels={${JSON.stringify(lv)}}` : ""}\n  accent="${v.accent}"${v.hideValue ? "\n  hideValue" : ""}${v.disabled ? "\n  disabled" : ""}\n/>`;
    },
  },
  "segmented-control": {
    component: "SegmentedControl",
    controls: [
      { type: "items", key: "options", label: "Options", min: 2, max: 6 },
      { type: "select", key: "size", label: "Size", options: ["sm", "md"] },
    ],
    defaults: {
      options: [
        { label: "List", icon: "List" },
        { label: "Board", icon: "Kanban" },
        { label: "Calendar", icon: "CalendarDays" },
      ],
      size: "md",
    },
    render: (v) => {
      const options = items(v.options).map((o, i) => {
        const Icon = ICONS[o.icon];
        return { value: `${slugify(o.label, i)}-${i}`, label: o.label, icon: Icon ? <Icon /> : undefined };
      });
      if (!options.length) return null;
      return <SegmentedControl aria-label="View" size={str(v.size) as "sm" | "md"} options={options} defaultValue={options[0].value} />;
    },
    code: (v) => {
      const opts = items(v.options);
      const used = [...new Set(opts.map((o) => o.icon).filter((i) => ICONS[i]))];
      return `${used.length ? `import { ${used.join(", ")} } from "lucide-react";\n\n` : ""}<SegmentedControl\n  size="${v.size}"\n  defaultValue="${slugify(opts[0]?.label ?? "", 0)}"\n  options={[\n${opts
        .map((o, i) => `    { value: "${slugify(o.label, i)}", label: "${o.label}"${ICONS[o.icon] ? `, icon: <${o.icon} />` : ""} },`)
        .join("\n")}\n  ]}\n/>`;
    },
  },
  stepper: {
    component: "Stepper",
    controls: [
      { type: "text", key: "label", label: "Label" },
      { type: "number", key: "min", label: "Min", min: 0, max: 50, step: 1 },
      { type: "number", key: "max", label: "Max", min: 5, max: 500, step: 5 },
      { type: "number", key: "step", label: "Step", min: 1, max: 25, step: 1 },
      { type: "number", key: "defaultValue", label: "Start at", min: 0, max: 500, step: 1 },
      { type: "text", key: "suffix", label: "Suffix" },
    ],
    defaults: { label: "Seats", min: 1, max: 10, step: 1, defaultValue: 3, suffix: "" },
    render: (v) => (
      <Stepper label={str(v.label)} min={n(v.min)} max={n(v.max)} step={n(v.step)} defaultValue={n(v.defaultValue)} format={(x) => `${x}${str(v.suffix)}`} />
    ),
    code: (v) =>
      `<Stepper label="${v.label}" min={${v.min}} max={${v.max}} step={${v.step}} defaultValue={${v.defaultValue}}${v.suffix ? ` format={(v) => \`\${v}${v.suffix}\`}` : ""} />`,
  },
  "code-input": {
    component: "CodeInput",
    controls: [
      { type: "number", key: "length", label: "Length", min: 4, max: 8, step: 1 },
      { type: "number", key: "groupSize", label: "Group size", min: 0, max: 4, step: 1 },
      { type: "select", key: "mode", label: "Mode", options: ["numeric", "alphanumeric"] },
      { type: "text", key: "label", label: "Label" },
      { type: "boolean", key: "disabled", label: "Disabled" },
    ],
    defaults: { length: 6, groupSize: 3, mode: "numeric", label: "Verification code", disabled: false },
    render: (v) => (
      <CodeInput
        length={n(v.length)}
        groupSize={n(v.groupSize)}
        mode={str(v.mode) as "numeric" | "alphanumeric"}
        label={str(v.label)}
        disabled={!!v.disabled}
        onComplete={(code) => new Promise((r) => setTimeout(() => r(code.startsWith("1")), 700))}
      />
    ),
  },
  "compare-slider": {
    component: "CompareSlider",
    controls: [
      { type: "select", key: "before", label: "Before", options: Object.keys(SIDES) },
      { type: "select", key: "after", label: "After", options: Object.keys(SIDES) },
      { type: "number", key: "defaultValue", label: "Divider at", min: 0, max: 100, step: 1, unit: "%" },
      { type: "number", key: "motionBlur", label: "Motion blur", min: 0, max: 24, step: 1, unit: "px" },
      { type: "number", key: "glitch", label: "Glitch", min: 0, max: 2, step: 0.05 },
      { type: "text", key: "beforeLabel", label: "Before label" },
      { type: "text", key: "afterLabel", label: "After label" },
    ],
    defaults: { before: "Skyline · mono", after: "Skyline", defaultValue: 50, motionBlur: 9, glitch: 1, beforeLabel: "Black and white", afterLabel: "Colour" },
    render: (v) => (
      <div className="w-full max-w-lg">
        <CompareSlider
          className="aspect-[4/3]"
          defaultValue={n(v.defaultValue)}
          motionBlur={n(v.motionBlur)}
          glitch={n(v.glitch)}
          beforeLabel={str(v.beforeLabel)}
          afterLabel={str(v.afterLabel)}
          before={SIDES[str(v.before)]}
          after={SIDES[str(v.after)]}
        />
      </div>
    ),
    code: (v) =>
      `<CompareSlider\n  defaultValue={${v.defaultValue}}\n  motionBlur={${v.motionBlur}}\n  glitch={${v.glitch}}\n  beforeLabel="${v.beforeLabel}"\n  afterLabel="${v.afterLabel}"\n  before={<Before />}\n  after={<After />}\n/>`,
  },
  button: {
    component: "Button",
    controls: [
      { type: "text", key: "children", label: "Label" },
      { type: "select", key: "tone", label: "Tone", options: ["signal", "ink", "paper", "ghost"] },
      { type: "select", key: "size", label: "Size", options: ["sm", "md", "lg"] },
      { type: "text", key: "hotkey", label: "Hotkey" },
      { type: "boolean", key: "disabled", label: "Disabled" },
    ],
    defaults: { children: "Save changes", tone: "signal", size: "md", hotkey: "s", disabled: false },
    render: (v) => (
      <Button
        tone={str(v.tone) as "signal" | "ink" | "paper" | "ghost"}
        size={str(v.size) as "sm" | "md" | "lg"}
        hotkey={str(v.hotkey) || undefined}
        disabled={!!v.disabled}
      >
        {str(v.children)}
      </Button>
    ),
  },
  "hold-to-confirm": {
    component: "HoldToConfirm",
    controls: [
      { type: "text", key: "children", label: "Label" },
      { type: "text", key: "doneLabel", label: "Done label" },
      { type: "number", key: "duration", label: "Hold for", min: 0.4, max: 4, step: 0.1, unit: "s" },
      { type: "select", key: "tone", label: "Tone", options: ["signal", "danger"] },
    ],
    defaults: { children: "Hold to delete", doneLabel: "Deleted", duration: 1.4, tone: "danger" },
    render: (v) => (
      <HoldToConfirm tone={str(v.tone) as "signal" | "danger"} duration={n(v.duration)} doneLabel={str(v.doneLabel)} icon={<Trash2 />}>
        {str(v.children)}
      </HoldToConfirm>
    ),
  },
  "trash-bin": {
    component: "TrashBin",
    controls: [{ type: "text", key: "files", label: "Files (comma separated)" }],
    defaults: { files: "notes.txt, draft-v2.md, invoice.pdf, todo.txt" },
    render: (v) => <TrashBin files={list(v.files)} />,
    code: (v) => `<TrashBin files={${JSON.stringify(list(v.files))}} />`,
  },
  "card-stack": {
    component: "CardStack",
    controls: [
      { type: "number", key: "count", label: "Cards", min: 2, max: 8, step: 1 },
      { type: "select", key: "aspectRatio", label: "Shape", options: ["3/4", "4/5", "1/1", "16/10"] },
    ],
    defaults: { count: 5, aspectRatio: "3/4" },
    render: (v) => (
      <CardStack
        aspectRatio={str(v.aspectRatio)}
        items={Array.from({ length: n(v.count) }, (_, i) => ({ id: String(i) }))}
        renderItem={(item) => (
          <div className={`flex size-full flex-col justify-between rounded-[22px] p-6 ring-1 ring-black/10 select-none ${STACK[Number(item.id) % STACK.length]}`}>
            <span className="font-mono text-xs opacity-70">Card {Number(item.id) + 1}</span>
            <span className="text-5xl font-semibold tracking-tight">{String(Number(item.id) + 1).padStart(2, "0")}</span>
          </div>
        )}
      />
    ),
    code: (v) => `<CardStack\n  aspectRatio="${v.aspectRatio}"\n  items={cards} // ${v.count} items with an id\n  renderItem={(card) => <Card {...card} />}\n/>`,
  },
  burst: {
    component: "Burst",
    controls: [
      { type: "number", key: "rings", label: "Rings", min: 2, max: 7, step: 1 },
      { type: "number", key: "perRing", label: "Cards per ring", min: 3, max: 10, step: 1 },
      { type: "number", key: "speed", label: "Speed", min: 10, max: 160, step: 2, unit: "px/s" },
      { type: "number", key: "itemWidth", label: "Card width", min: 100, max: 320, step: 10, unit: "px" },
      { type: "number", key: "itemHeight", label: "Card height", min: 80, max: 320, step: 10, unit: "px" },
      { type: "boolean", key: "pauseOnHover", label: "Pause on hover" },
      { type: "boolean", key: "showOrigin", label: "Show origin" },
    ],
    defaults: { rings: 4, perRing: 6, speed: 46, itemWidth: 120, itemHeight: 150, pauseOnHover: true, showOrigin: true },
    render: (v) => (
      <Burst
        items={IMAGES}
        rings={n(v.rings)}
        perRing={n(v.perRing)}
        speed={n(v.speed)}
        itemWidth={n(v.itemWidth)}
        itemHeight={n(v.itemHeight)}
        pauseOnHover={!!v.pauseOnHover}
        showOrigin={!!v.showOrigin}
        className="h-[26rem] rounded-xl bg-neutral-50 dark:bg-neutral-950"
        renderItem={(p) => <Photo {...p} />}
      />
    ),
    remount: false,
    code: (v) =>
      `<Burst\n  items={items}\n  renderItem={(item) => <Card {...item} />}\n  rings={${v.rings}}\n  perRing={${v.perRing}}\n  speed={${v.speed}}\n  itemWidth={${v.itemWidth}}\n  itemHeight={${v.itemHeight}}\n  pauseOnHover={${v.pauseOnHover}}\n  showOrigin={${v.showOrigin}}\n/>`,
  },
  "drift-canvas": {
    component: "DriftCanvas",
    remount: false,
    controls: [
      { type: "number", key: "angle", label: "Direction", min: 0, max: 359, step: 1, unit: "°" },
      { type: "number", key: "speed", label: "Speed", min: 0, max: 160, step: 2, unit: "px/s" },
      { type: "number", key: "itemWidth", label: "Card width", min: 100, max: 360, step: 10, unit: "px" },
      { type: "number", key: "itemHeight", label: "Card height", min: 100, max: 420, step: 10, unit: "px" },
      { type: "number", key: "gap", label: "Gap", min: 0, max: 48, step: 2, unit: "px" },
      { type: "boolean", key: "stagger", label: "Brick rows" },
      { type: "boolean", key: "draggable", label: "Draggable" },
      { type: "boolean", key: "pauseOnHover", label: "Pause on hover" },
    ],
    defaults: { angle: 215, speed: 28, itemWidth: 180, itemHeight: 220, gap: 20, stagger: true, draggable: true, pauseOnHover: false },
    render: (v) => (
      <DriftCanvas
        items={IMAGES}
        angle={n(v.angle)}
        speed={n(v.speed)}
        itemWidth={n(v.itemWidth)}
        itemHeight={n(v.itemHeight)}
        gap={n(v.gap)}
        stagger={!!v.stagger}
        draggable={!!v.draggable}
        pauseOnHover={!!v.pauseOnHover}
        className="h-[26rem] rounded-xl bg-neutral-50 dark:bg-neutral-950"
        renderItem={(p) => <Photo {...p} />}
      />
    ),
    code: (v) =>
      `<DriftCanvas\n  items={photos}\n  renderItem={(p) => <img src={p.src} alt={p.alt} />}\n  angle={${v.angle}}\n  speed={${v.speed}}\n  itemWidth={${v.itemWidth}}\n  itemHeight={${v.itemHeight}}\n  gap={${v.gap}}\n  stagger={${v.stagger}}\n  draggable={${v.draggable}}\n  pauseOnHover={${v.pauseOnHover}}\n/>`,
  },
  "focus-canvas": {
    component: "FocusCanvas",
    controls: [
      { type: "number", key: "hold", label: "Rest on each", min: 800, max: 6000, step: 100, unit: "ms" },
      { type: "number", key: "travel", label: "Move takes", min: 1000, max: 5000, step: 100, unit: "ms" },
      { type: "number", key: "focusScale", label: "Focus zoom", min: 0.8, max: 1.6, step: 0.05 },
      { type: "number", key: "overviewScale", label: "Overview zoom", min: 0.35, max: 0.9, step: 0.05 },
      { type: "number", key: "blur", label: "Blur around", min: 0, max: 16, step: 1, unit: "px" },
      { type: "number", key: "itemWidth", label: "Card width", min: 140, max: 360, step: 10, unit: "px" },
      { type: "number", key: "itemHeight", label: "Card height", min: 140, max: 420, step: 10, unit: "px" },
    ],
    defaults: { hold: 2400, travel: 2600, focusScale: 1.1, overviewScale: 0.6, blur: 7, itemWidth: 200, itemHeight: 250 },
    render: (v) => (
      <FocusCanvas
        items={IMAGES}
        hold={n(v.hold)}
        travel={n(v.travel)}
        focusScale={n(v.focusScale)}
        overviewScale={n(v.overviewScale)}
        blur={n(v.blur)}
        itemWidth={n(v.itemWidth)}
        itemHeight={n(v.itemHeight)}
        className="h-[26rem] rounded-xl bg-neutral-50 dark:bg-neutral-950"
        renderItem={(p) => <Photo {...p} />}
      />
    ),
    code: (v) =>
      `<FocusCanvas\n  items={photos}\n  renderItem={(p) => <img src={p.src} alt={p.alt} />}\n  hold={${v.hold}}\n  travel={${v.travel}}\n  focusScale={${v.focusScale}}\n  overviewScale={${v.overviewScale}}\n  blur={${v.blur}}\n  itemWidth={${v.itemWidth}}\n  itemHeight={${v.itemHeight}}\n/>`,
  },
  "number-ticker": {
    component: "NumberTicker",
    remount: false,
    controls: [
      { type: "number", key: "value", label: "Value", min: 0, max: 100000, step: 137 },
      { type: "select", key: "style", label: "Format", options: ["decimal", "currency", "percent"] },
      { type: "number", key: "decimals", label: "Decimals", min: 0, max: 2, step: 1 },
      { type: "number", key: "duration", label: "Run", min: 200, max: 1200, step: 20, unit: "ms" },
      { type: "number", key: "stagger", label: "Per digit", min: 0, max: 250, step: 10, unit: "ms" },
      { type: "color", key: "streak", label: "Streak", options: STREAKS },
    ],
    defaults: { value: 48336, style: "currency", decimals: 0, duration: 420, stagger: 90, streak: "var(--color-amber-400)" },
    render: (v) => {
      const percent = v.style === "percent";
      return (
        <NumberTicker
          value={percent ? n(v.value) / 100000 : n(v.value)}
          format={{ style: str(v.style) as "decimal" | "currency" | "percent", currency: "USD", minimumFractionDigits: n(v.decimals), maximumFractionDigits: n(v.decimals) }}
          duration={n(v.duration)}
          stagger={n(v.stagger)}
          streak={str(v.streak)}
          className="text-6xl font-semibold tracking-tight text-neutral-950 [text-shadow:0_1px_0_rgb(255_255_255/0.6),0_0.04em_0.08em_rgb(0_0_0/0.12),0_0.12em_0.3em_rgb(0_0_0/0.1)] dark:text-neutral-50 dark:[text-shadow:0_0.04em_0.1em_rgb(0_0_0/0.6),0_0.12em_0.35em_rgb(0_0_0/0.5)] tabular-nums"
        />
      );
    },
    code: (v) => `<NumberTicker value={${v.value}} format={{ style: "${v.style}"${v.style === "currency" ? ', currency: "USD"' : ""}, maximumFractionDigits: ${v.decimals} }} duration={${v.duration}} stagger={${v.stagger}} streak="${v.streak}" />`,
  },
  typeset: {
    component: "Typeset",
    controls: [
      { type: "text", key: "text", label: "Text" },
      { type: "text", key: "highlight", label: "Highlight" },
      { type: "number", key: "startScale", label: "Typed at", min: 0.5, max: 0.95, step: 0.01, unit: "×" },
      { type: "number", key: "speed", label: "Per letter", min: 20, max: 120, step: 5, unit: "ms" },
      { type: "color", key: "color", label: "Colour", options: COLORS },
    ],
    defaults: { text: "Interfaces that act.", highlight: "act.", startScale: 0.86, speed: 45, color: "var(--color-blue-500)" },
    render: (v) => (
      <Typeset
        text={str(v.text)}
        highlight={str(v.highlight) || undefined}
        startScale={n(v.startScale)}
        speed={n(v.speed)}
        color={str(v.color)}
        className="text-5xl leading-[1.05] font-semibold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50"
      />
    ),
    code: (v) => `<Typeset\n  text="${v.text}"\n  highlight="${v.highlight}"\n  startScale={${v.startScale}}\n  speed={${v.speed}}\n/>`,
  },
  "text-focus": {
    component: "TextFocus",
    controls: [
      { type: "text", key: "text", label: "Text" },
      { type: "select", key: "frame", label: "Frame", options: ["brackets", "handles"] },
      { type: "number", key: "blur", label: "Blur", min: 0, max: 0.25, step: 0.01, unit: "em" },
      { type: "number", key: "dim", label: "Dim to", min: 0, max: 1, step: 0.05 },
      { type: "boolean", key: "remember", label: "Remember read words" },
      { type: "color", key: "color", label: "Colour", options: COLORS },
    ],
    defaults: { text: "Text Focus Component", frame: "brackets", blur: 0.09, dim: 0.45, remember: false, color: "var(--color-blue-500)" },
    render: (v) => (
      <TextFocus
        as="h2"
        text={str(v.text)}
        frame={str(v.frame) as "brackets" | "handles"}
        blur={n(v.blur)}
        dim={n(v.dim)}
        remember={!!v.remember}
        color={str(v.color)}
        className="max-w-xl text-center text-6xl leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50"
      />
    ),
    code: (v) => `<TextFocus\n  as="h2"\n  text="${v.text}"\n  frame="${v.frame}"\n  blur={${v.blur}}\n  dim={${v.dim}}${v.remember ? "\n  remember" : ""}\n/>`,
  },
  "folder-card": {
    component: "FolderCard",
    controls: [
      { type: "text", key: "title", label: "Title" },
      { type: "text", key: "meta", label: "Meta" },
      { type: "text", key: "files", label: "Files (comma separated)" },
      { type: "color", key: "color", label: "Colour", options: COLORS },
    ],
    defaults: { title: "Incident reports", meta: "12 postmortems · updated today", files: "api-outage.md, timeline.csv, postmortem.pdf, latency.png, runbook.md", color: "var(--color-blue-500)" },
    render: (v) => (
      <div className="px-10 pt-28 pb-4">
        <FolderCard title={str(v.title)} meta={str(v.meta)} files={list(v.files)} color={str(v.color)} className="w-72" />
      </div>
    ),
    code: (v) => `<FolderCard\n  title="${v.title}"\n  meta="${v.meta}"\n  files={[${list(v.files).map((f) => `"${f}"`).join(", ")}]}\n/>`,
  },
  "infinite-grid": {
    component: "InfiniteGrid",
    controls: [
      { type: "number", key: "cellWidth", label: "Cell width", min: 100, max: 360, step: 10, unit: "px" },
      { type: "number", key: "cellHeight", label: "Cell height", min: 80, max: 320, step: 10, unit: "px" },
      { type: "number", key: "gap", label: "Gap", min: 0, max: 48, step: 2, unit: "px" },
      { type: "boolean", key: "wheel", label: "Scroll with the wheel" },
    ],
    defaults: { cellWidth: 180, cellHeight: 220, gap: 16, wheel: true },
    render: (v) => (
      <InfiniteGrid
        items={IMAGES}
        cellWidth={n(v.cellWidth)}
        cellHeight={n(v.cellHeight)}
        gap={n(v.gap)}
        wheel={!!v.wheel}
        className="h-[24rem] rounded-xl bg-neutral-50 dark:bg-neutral-950"
        renderItem={(p) => <Photo {...p} />}
      />
    ),
    code: (v) => `<InfiniteGrid\n  items={items}\n  renderItem={(item) => <Tile {...item} />}\n  cellWidth={${v.cellWidth}}\n  cellHeight={${v.cellHeight}}\n  gap={${v.gap}}\n  wheel={${v.wheel}}\n/>`,
  },
  "layer-text": {
    component: "LayerText",
    controls: [
      { type: "text", key: "text", label: "Text" },
      { type: "number", key: "size", label: "Size", min: 32, max: 200, step: 2, unit: "px" },
      { type: "number", key: "weight", label: "Weight", min: 300, max: 900, step: 100 },
      { type: "number", key: "tracking", label: "Tracking", min: -0.1, max: 0.1, step: 0.01, unit: "em" },
      { type: "number", key: "outline", label: "Outline", min: 1, max: 6, step: 0.5, unit: "px" },
      { type: "number", key: "padding", label: "Padding", min: 0, max: 40, step: 1, unit: "px" },
      { type: "number", key: "handle", label: "Handles", min: 4, max: 16, step: 1, unit: "px" },
      { type: "boolean", key: "showSize", label: "Show size" },
      { type: "color", key: "color", label: "Colour", options: COLORS },
    ],
    defaults: { text: "ABHISHEK", size: 112, weight: 800, tracking: -0.04, outline: 2, padding: 12, handle: 8, showSize: true, color: "var(--color-blue-500)" },
    remount: false,
    render: (v) => (
      <LayerText
        text={str(v.text)}
        size={n(v.size)}
        weight={n(v.weight)}
        tracking={n(v.tracking)}
        outline={n(v.outline)}
        padding={n(v.padding)}
        handle={n(v.handle)}
        showSize={!!v.showSize}
        color={str(v.color)}
        className="text-neutral-950 dark:text-neutral-50"
      />
    ),
  },
  "prune-reveal-animation": {
    component: "PruneReveal",
    controls: [
      { type: "select", key: "photo", label: "Image", options: Object.keys(PHOTOS) },
      { type: "number", key: "duration", label: "Burn", min: 1500, max: 10000, step: 250, unit: "ms" },
      { type: "number", key: "wait", label: "Generating for", min: 500, max: 6000, step: 250, unit: "ms" },
    ],
    defaults: { photo: "Skyline", duration: 5600, wait: 2200 },
    render: (v) => <PruneDemo photo={str(v.photo)} duration={n(v.duration)} wait={n(v.wait)} />,
    code: (v) => `<PruneReveal\n  src={image} // undefined while the model works\n  alt="${PHOTOS[str(v.photo)]?.prompt}"\n  prompt="${PHOTOS[str(v.photo)]?.prompt}"\n  duration={${v.duration}}\n/>`,
  },
  orb: {
    component: "Orb",
    remount: false,
    controls: [
      { type: "select", key: "state", label: "State", options: ["idle", "listening", "thinking", "speaking"] },
      { type: "select", key: "variant", label: "Variant", options: ["liquid", "halo"] },
      { type: "select", key: "palette", label: "Palette", options: Object.keys(orbPalettes) },
      { type: "number", key: "size", label: "Size", min: 96, max: 320, step: 8, unit: "px" },
      { type: "number", key: "level", label: "Level", min: 0, max: 1, step: 0.05 },
      { type: "boolean", key: "bezel", label: "Bezel" },
    ],
    defaults: { state: "idle", variant: "liquid", palette: "accent", size: 220, level: 0, bezel: true },
    render: (v) => (
      <Orb state={str(v.state) as OrbState} variant={str(v.variant) as OrbVariant} palette={str(v.palette) as OrbPalette} size={n(v.size)} level={n(v.level)} bezel={!!v.bezel} />
    ),
  },
  "prompt-input": {
    component: "PromptInput",
    remount: false,
    controls: [
      { type: "text", key: "placeholder", label: "Placeholder" },
      { type: "boolean", key: "busy", label: "Busy" },
    ],
    defaults: { placeholder: "Ask anything…", busy: false },
    render: (v) => (
      <div className="w-full max-w-xl">
        <PromptInput placeholder={str(v.placeholder)} busy={!!v.busy} onSubmit={() => {}} />
      </div>
    ),
  },
  "command-palette": {
    component: "CommandPalette",
    controls: [
      { type: "text", key: "hotkey", label: "Hotkey (with ⌘)" },
      { type: "text", key: "placeholder", label: "Placeholder" },
    ],
    defaults: { hotkey: "j", placeholder: "Type a command or search…" },
    render: (v) => <PaletteDemo hotkey={str(v.hotkey) || "j"} placeholder={str(v.placeholder)} />,
    code: (v) => `<CommandPalette\n  open={open}\n  onOpenChange={setOpen}\n  commands={commands}\n  hotkey="${v.hotkey}"\n  placeholder="${v.placeholder}"\n/>`,
  },
};

/** A JSX snippet for the current values: every prop the controls set, in order. */
export function snippet(pg: Playground, v: Values) {
  if (pg.code) return pg.code(v);
  const props: string[] = [];
  let children = "";
  for (const c of pg.controls) {
    const val = v[c.key];
    if (c.key === "children") {
      children = String(val);
      continue;
    }
    if (typeof val === "boolean") {
      if (val) props.push(c.key);
    } else if (typeof val === "number") props.push(`${c.key}={${val}}`);
    else if (val !== "") props.push(`${c.key}="${val}"`);
  }
  const open = props.length > 3 ? `<${pg.component}\n  ${props.join("\n  ")}\n` : `<${pg.component}${props.length ? ` ${props.join(" ")}` : ""}`;
  return children ? `${open}${props.length > 3 ? "" : ""}>${children}</${pg.component}>` : `${open}${props.length > 3 ? "" : " "}/>`;
}
