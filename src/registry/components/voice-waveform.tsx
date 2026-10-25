"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";

const BARS = 28;

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Waveform() {
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.1));

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      // Speech-like envelope: syllables with short pauses.
      const syllable = Math.abs(Math.sin(t / 2.3)) * (Math.sin(t / 7) > -0.6 ? 1 : 0.15);
      const next = Math.max(0.08, Math.min(1, syllable * (0.55 + Math.random() * 0.45)));
      setLevels((l) => [...l.slice(1), next]);
    }, 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-7 flex-1 items-center gap-[3px]">
      {levels.map((level, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-base-300"
          animate={{ height: `${level * 100}%`, opacity: 0.35 + (i / BARS) * 0.65 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ))}
    </div>
  );
}

export function VoiceRecorder({
  onSend,
  label = "Hold a thought",
  className,
}: {
  onSend?: (seconds: number) => void;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "recording" | "sent">("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "sent") return;
    const id = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <motion.div
      layout
      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      style={{ borderRadius: 999 }}
      data-slot="voice-recorder"
      className={cn("flex h-12 items-center overflow-hidden bg-base-900 p-1.5 shadow-xl shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            onClick={() => {
              setSeconds(0);
              setState("recording");
            }}
            className="flex h-9 items-center gap-2 rounded-full pr-4 pl-3 text-sm font-medium text-base-200 transition-colors hover:bg-base-50/5"
          >
            <Mic className="size-4" /> {label}
          </motion.button>
        )}
        {state === "recording" && (
          <motion.div
            key="rec"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            className="flex w-72 items-center gap-3"
          >
            <button
              onClick={() => setState("idle")}
              aria-label="Cancel"
              className="grid size-9 shrink-0 place-items-center rounded-full text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100"
            >
              <X className="size-4" />
            </button>
            <motion.span
              className="size-2 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <Waveform />
            <span className="w-8 shrink-0 font-mono text-xs text-base-400 tabular-nums">{formatTime(seconds)}</span>
            <button
              onClick={() => {
                onSend?.(seconds);
                setState("sent");
              }}
              aria-label="Send"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-base-50 text-base-950 inset-shadow-2xs inset-shadow-white active:scale-95"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
        {state === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            className="flex h-9 items-center gap-2 pr-4 pl-3 text-sm text-base-300"
          >
            <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-neutral-950">
              <Check className="size-3" strokeWidth={3} />
            </span>
            Sent · {formatTime(seconds)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Demo() {
  return <VoiceRecorder />;
}
