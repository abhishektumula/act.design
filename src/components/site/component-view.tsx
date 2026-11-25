"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Code2, Eye, Maximize, Minimize, RotateCcw, Sparkles, Terminal } from "lucide-react";
import { Preview } from "@/registry/previews";
import { Customize, useValues } from "./values";

type View = "preview" | "code";

const tray = "inline-flex items-center gap-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]";
const key = "flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-neutral-50";

/** Copies an agent prompt or the install line, from a small menu. */
function CopyPrompt({ prompt, install }: { prompt: string; install: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(null), 1600);
    return () => clearTimeout(t);
  }, [done]);

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(what);
    } catch {}
    setOpen(false);
  };

  const options = [
    { id: "prompt", label: "Copy prompt", hint: "For Claude Code, Codex or Cursor", icon: Sparkles, text: prompt },
    { id: "install", label: "Copy install command", hint: install, icon: Terminal, text: install },
  ];

  return (
    <div ref={root} className={`${tray} relative`}>
      <button type="button" onClick={() => copy("prompt", prompt)} className={key}>
        {done ? <Check className="size-4 text-blue-600 dark:text-blue-500" /> : <Sparkles className="size-4" />}
        {done === "install" ? "Copied command" : done ? "Copied prompt" : "Copy prompt"}
      </button>
      <button type="button" aria-label="More copy options" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${key} px-2`}>
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full right-0 z-30 mt-2 w-72 origin-top-right rounded-xl bg-neutral-50 dark:bg-neutral-950 p-1 shadow-2xl ring-1 ring-neutral-950/10 dark:ring-neutral-50/10"
          >
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => copy(o.id, o.text)}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <o.icon className="mt-0.5 size-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-950 dark:text-neutral-50">{o.label}</span>
                  <span className="block truncate text-xs text-neutral-500">{o.hint}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ComponentView({ slug, code, prompt, install }: { slug: string; code: ReactNode; prompt: string; install: string }) {
  const id = useId();
  const [view, setView] = useState<View>("preview");
  const [run, setRun] = useState(0);
  const [full, setFull] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const live = useValues(slug);
  const { pg } = live;

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === stage.current && !!stage.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen?.();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className={tray}>
          {(
            [
              ["preview", "Preview", Eye],
              ["code", "Code", Code2],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`relative flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                view === value ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {view === value && (
                <motion.span
                  layoutId={`${id}-view`}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  className="absolute inset-0 rounded-lg bg-neutral-200 dark:bg-neutral-800 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)]"
                />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === "preview" && (
            <div className={tray}>
              <button type="button" onClick={() => setRun((r) => r + 1)} className={key}>
                <RotateCcw className="size-4" /> Replay
              </button>
              <button type="button" onClick={toggleFull} aria-label={full ? "Exit fullscreen" : "Fullscreen"} title="Fullscreen" className={`${key} px-2`}>
                {full ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
            </div>
          )}
          <CopyPrompt prompt={prompt} install={install} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {view === "preview" ? (
            <div
              ref={stage}
              className="relative flex min-h-[34rem] items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-black p-4 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] sm:p-10"
            >
              {/* The showcase is the one copy being customized below; a remount replays it. */}
              <div key={`${run}:${pg && pg.remount !== false ? JSON.stringify(live.values) : ""}`} className="@container relative flex w-full justify-center">
                {pg ? pg.render(live.values) : <Preview slug={slug} />}
              </div>
            </div>
          ) : (
            code
          )}
        </motion.div>
      </AnimatePresence>

      {pg && view === "preview" && <Customize {...live} pg={pg} />}
    </div>
  );
}
