"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Code2, ExternalLink, Eye, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockFrame } from "./block-frame";

const viewports = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%" as const },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

function Pill<T extends string>({
  value,
  onChange,
  options,
  iconOnly,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon: typeof Eye }[];
  iconOnly?: boolean;
}) {
  const id = useId();
  return (
    <div className="inline-flex rounded-xl bg-base-950 p-1 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/60">
      {options.map(({ id: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-label={label}
          title={label}
          className={cn(
            "relative flex h-8 items-center gap-1.5 rounded-lg text-[13px] font-medium transition-colors",
            iconOnly ? "w-9 justify-center" : "px-3.5",
            value === v ? "text-base-50" : "text-base-500 hover:text-base-300",
          )}
        >
          {value === v && (
            <motion.span
              layoutId={`${id}-pill`}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="absolute inset-0 rounded-lg bg-linear-to-b from-base-700 to-base-800 shadow-md shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15"
            />
          )}
          <Icon className="relative size-3.5" />
          {!iconOnly && <span className="relative">{label}</span>}
        </button>
      ))}
    </div>
  );
}

export function BlockView({ slug, code }: { slug: string; code: ReactNode }) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState("desktop");
  const [reload, setReload] = useState(0);
  const width = viewports.find((v) => v.id === viewport)!.width;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Pill
          value={view}
          onChange={setView}
          options={[
            { id: "preview", label: "Preview", icon: Eye },
            { id: "code", label: "Code", icon: Code2 },
          ]}
        />
        {view === "preview" && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Pill value={viewport} onChange={setViewport} options={viewports} iconOnly />
            </div>
            <button
              onClick={() => setReload((r) => r + 1)}
              aria-label="Replay"
              title="Replay"
              className="grid size-10 place-items-center rounded-xl text-base-500 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-200"
            >
              <RotateCcw className="size-4" />
            </button>
            <a
              href={`/view/blocks/${slug}`}
              target="_blank"
              aria-label="Open in new tab"
              title="Open in new tab"
              className="grid size-10 place-items-center rounded-xl text-base-500 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-200"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
          transition={{ duration: 0.2 }}
        >
          {view === "preview" ? (
            <div className="rounded-2xl bg-base-950 p-2 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 sm:p-3">
              <BlockFrame slug={slug} width={width} reloadKey={reload} />
            </div>
          ) : (
            code
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
