"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, FileCode2, RotateCcw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type Message =
  | { role: "user"; text: string }
  | { role: "tool"; title: string; lines: string[] }
  | { role: "assistant"; text: string };

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-base-800 px-3.5 py-2 text-sm leading-6 text-base-100 inset-shadow-2xs inset-shadow-white/5">
        {text}
      </p>
    </div>
  );
}

function ToolCall({ title, lines }: { title: string; lines: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-base-900/70 ring-1 ring-base-50/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-base-400 transition-colors hover:text-base-100"
      >
        <Terminal className="size-3.5" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronRight className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-t border-base-50/5 px-3 py-2.5">
              {lines.map((l) => (
                <p key={l} className="flex items-center gap-2 font-mono text-xs text-base-500">
                  <FileCode2 className="size-3" /> {l}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssistantText({ text }: { text: string }) {
  const tokens = text.match(/\S+\s*/g) ?? [];
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= tokens.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 40);
    return () => clearTimeout(t);
  }, [count, tokens.length]);

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 size-6 shrink-0 rounded-full bg-[conic-gradient(from_0deg,var(--color-sky-400),var(--color-violet-500),var(--color-fuchsia-400),var(--color-sky-400))] shadow-md shadow-violet-500/30 ring-1 ring-base-50/20" />
      <p className="text-sm leading-6 text-base-300">
        {tokens.slice(0, count).map((token, i) => (
          <motion.span key={i} initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }}>
            {token}
          </motion.span>
        ))}
      </p>
    </div>
  );
}

export function ChatThread({ messages, className }: { messages: Message[]; className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
    Array.from(el.children).forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scroller} data-slot="chat-thread" className={cn("h-full overflow-y-auto [scrollbar-width:none]", className)}>
      <div className="flex flex-col gap-4 p-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {m.role === "user" && <UserBubble text={m.text} />}
            {m.role === "tool" && <ToolCall title={m.title} lines={m.lines} />}
            {m.role === "assistant" && <AssistantText text={m.text} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const script: Message[] = [
  { role: "user", text: "Can you add a dark mode toggle to settings?" },
  { role: "tool", title: "Read 2 files, edited 1", lines: ["src/app/settings/page.tsx", "src/lib/theme.ts", "+ src/components/theme-toggle.tsx"] },
  {
    role: "assistant",
    text: "Done. I added a ThemeToggle with a spring thumb under Appearance. It reads the system preference first and remembers your choice in a cookie, so there is no flash on reload.",
  },
];

export default function Demo() {
  const [shown, setShown] = useState(1);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (shown >= script.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [shown, run]);

  return (
    <div className="relative h-80 w-full max-w-md overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-50/10">
      <ChatThread key={run} messages={script.slice(0, shown)} />
      <button
        onClick={() => {
          setShown(1);
          setRun((r) => r + 1);
        }}
        aria-label="Replay"
        className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-base-900 text-base-500 ring-1 ring-base-50/10 hover:text-base-100"
      >
        <RotateCcw className="size-3" />
      </button>
    </div>
  );
}
