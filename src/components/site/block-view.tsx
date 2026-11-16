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
    <div className="inline-flex rounded-md bg-base-950 p-0.5 ring-1 ring-base-50/[0.08]">
      {options.map(({ id: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-label={label}
          title={label}
          className={cn(
            "relative flex h-7 items-center gap-1.5 rounded-[4px] font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
            iconOnly ? "w-8 justify-center" : "px-3",
            value === v ? "text-base-50" : "text-base-500 hover:text-base-300",
          )}
        >
          {value === v && (
            <motion.span
              layoutId={`${id}-pill`}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="absolute inset-0 rounded-[4px] bg-base-50/[0.07] ring-1 ring-base-50/[0.08]"
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
              className="grid size-8 place-items-center rounded-md text-base-500 ring-1 ring-base-50/[0.08] transition-colors hover:text-base-200 hover:ring-base-50/15"
            >
              <RotateCcw className="size-4" />
            </button>
            <a
              href={`/view/blocks/${slug}`}
              target="_blank"
              aria-label="Open in new tab"
              title="Open in new tab"
              className="grid size-8 place-items-center rounded-md text-base-500 ring-1 ring-base-50/[0.08] transition-colors hover:text-base-200 hover:ring-base-50/15"
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
            <div className="rounded-lg bg-base-950 p-2 ring-1 ring-base-50/[0.08] sm:p-3">
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
