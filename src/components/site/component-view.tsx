"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Code2, Eye, RotateCcw } from "lucide-react";
import { Preview } from "@/registry/previews";

type View = "preview" | "code";

export function ComponentView({ slug, code }: { slug: string; code: ReactNode }) {
  const id = useId();
  const [view, setView] = useState<View>("preview");
  const [run, setRun] = useState(0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex rounded-md bg-base-950 p-0.5 ring-1 ring-base-50/[0.08]">
          {(
            [
              ["preview", "Preview", Eye],
              ["code", "Code", Code2],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`relative flex h-7 items-center gap-1.5 rounded-[4px] px-3 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
                view === value ? "text-base-50" : "text-base-500 hover:text-base-300"
              }`}
            >
              {view === value && (
                <motion.span
                  layoutId={`${id}-view`}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  className="absolute inset-0 rounded-[4px] bg-base-50/[0.07] ring-1 ring-base-50/[0.08]"
                />
              )}
              <Icon className="relative size-3.5" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        {view === "preview" && (
          <button
            onClick={() => setRun((r) => r + 1)}
            className="flex h-8 items-center gap-1.5 rounded-md px-3 font-mono text-[11px] tracking-[0.08em] text-base-500 uppercase ring-1 ring-base-50/[0.08] transition-colors hover:text-base-200 hover:ring-base-50/15"
          >
            <RotateCcw className="size-3.5" /> Replay
          </button>
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
            <div className="relative flex min-h-[34rem] items-center justify-center overflow-hidden rounded-lg bg-base-950 p-10 ring-1 ring-base-50/[0.08]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--base-800)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] opacity-50" />
              <div key={run} className="@container relative flex w-full justify-center">
                <Preview slug={slug} />
              </div>
            </div>
          ) : (
            code
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
