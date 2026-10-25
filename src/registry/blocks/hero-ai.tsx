"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, FileText, Globe, Sparkles, Wand2 } from "lucide-react";
import { AIOrb } from "@/components/ui/ai-orb";
import { PromptInput } from "@/components/ui/prompt-input";
import { TextStagger } from "@/components/ui/text-stagger";
import { cn } from "@/lib/utils";

const suggestions = [
  { icon: Wand2, label: "Redesign my pricing page" },
  { icon: FileText, label: "Summarise this PDF" },
  { icon: Globe, label: "Research competitors" },
];

export function HeroAI({
  eyebrow = "Introducing Lumen 2.0",
  title = "Ask once. Your agent handles the rest.",
  body = "Lumen plans, researches and ships work across your tools, while you stay in the loop on every step.",
  className,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <section data-slot="hero-ai" className={cn("relative isolate overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      {/* Soft orb glow behind everything */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-[640px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-24 left-1/2 -z-10 size-[420px] -translate-x-[10%] rounded-full bg-sky-500/10 blur-3xl" />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.3 }}>
          <AIOrb size={88} state={busy ? "thinking" : "idle"} />
        </motion.div>

        <motion.a
          href="#"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-base-900/80 py-1 pr-3 pl-1.5 text-sm text-base-300 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 backdrop-blur transition-colors hover:text-base-50"
        >
          <span className="grid size-6 place-items-center rounded-full bg-linear-to-b from-violet-400 to-violet-600 text-white inset-shadow-2xs inset-shadow-white/40">
            <Sparkles className="size-3" />
          </span>
          {eyebrow}
          <ArrowRight className="size-3.5 text-base-500 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <TextStagger
          as="h1"
          text={title}
          delay={0.2}
          className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-base-50 sm:text-6xl"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-xl text-lg leading-8 text-pretty text-base-400"
        >
          {body}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="mt-12 w-full text-left"
        >
          <PromptInput
            busy={busy}
            onSubmit={() => {
              setBusy(true);
              setTimeout(() => setBusy(false), 3200);
            }}
            onStop={() => setBusy(false)}
            placeholder="What should Lumen do for you?"
          />
        </motion.div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <AnimatePresence>
            {!busy &&
              suggestions.map(({ icon: Icon, label }, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.9 + i * 0.06 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-base-950 px-3 text-[13px] text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-900 hover:text-base-100"
                >
                  <Icon className="size-3.5" /> {label}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <HeroAI />;
}
