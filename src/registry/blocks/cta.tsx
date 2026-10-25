"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done";

export function CTA({
  title = "Start building in minutes.",
  body = "Free for personal projects. No card, no sales call, no catch.",
  className,
}: {
  title?: string;
  body?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  return (
    <section data-slot="cta" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-20 text-center shadow-2xl shadow-shade/50 ring-1 ring-neutral-50/10 inset-shadow-2xs inset-shadow-white/15 sm:px-16">
        {/* Light source */}
        <motion.div
          className="absolute -top-48 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-blue-600/40 blur-3xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-blue-300/60 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-neutral-800)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-balance text-white sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-neutral-400">{body}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email || status !== "idle") return;
            setStatus("loading");
            setTimeout(() => setStatus("done"), 1200);
          }}
          className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-2xl bg-neutral-900 p-1.5 ring-1 ring-neutral-50/10 inset-shadow-sm inset-shadow-black/60 focus-within:ring-blue-500/60"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "done"}
            placeholder="you@company.com"
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-neutral-500"
          />
          <motion.button
            layout
            disabled={status !== "idle"}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-sm font-medium transition-colors",
              status === "done"
                ? "bg-emerald-500 text-neutral-950"
                : "bg-white text-neutral-950 inset-shadow-2xs inset-shadow-white hover:bg-neutral-200",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                className="flex items-center gap-2"
              >
                {status === "idle" && (
                  <>
                    Get started <ArrowRight className="size-4" />
                  </>
                )}
                {status === "loading" && <Loader2 className="size-4 animate-spin" />}
                {status === "done" && (
                  <>
                    <Check className="size-4" /> Check your inbox
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </form>
        <p className="mt-4 text-xs text-neutral-500">Join 12,000+ developers. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

export default function Block() {
  return <CTA />;
}
