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
        <div className="inline-flex rounded-xl bg-base-950 p-1 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/60">
          {(
            [
              ["preview", "Preview", Eye],
              ["code", "Code", Code2],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`relative flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition-colors ${
                view === value ? "text-base-50" : "text-base-500 hover:text-base-300"
              }`}
            >
              {view === value && (
                <motion.span
                  layoutId={`${id}-view`}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  className="absolute inset-0 rounded-lg bg-linear-to-b from-base-700 to-base-800 shadow-md shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15"
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
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-base-500 transition-colors hover:bg-base-50/5 hover:text-base-200"
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
            <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden rounded-2xl bg-base-950 p-10 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
              <div key={run} className="relative flex w-full justify-center">
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
