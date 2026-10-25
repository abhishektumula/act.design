"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

const faces = ["from-violet-400 to-fuchsia-500", "from-amber-300 to-orange-500", "from-emerald-300 to-teal-500", "from-sky-400 to-blue-600", "from-rose-400 to-pink-500"];

export function Waitlist({
  title = "Something calm is coming.",
  body = "A new kind of inbox that reads, sorts and drafts for you. Be first in line when we open the doors.",
  initialCount = 2847,
  className,
}: {
  title?: string;
  body?: string;
  initialCount?: number;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const count = initialCount + (joined ? 1 : 0);

  return (
    <section data-slot="waitlist" className={cn("relative isolate overflow-hidden bg-canvas px-6 py-28", className)}>
      {/* Concentric rings */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-base-50/[0.04]"
          style={{ width: `${i * 18}rem`, height: `${i * 18}rem` }}
        />
      ))}

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-base-950 px-3 py-1 text-xs font-medium text-base-400 ring-1 ring-base-50/10">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500" />
            <span className="relative size-1.5 rounded-full bg-emerald-500" />
          </span>
          Private beta · Spring 2027
        </span>
        <h2 className="mt-6 text-4xl font-semibold tracking-[-0.035em] text-balance text-base-50 sm:text-6xl">{title}</h2>
        <p className="mt-5 text-lg leading-8 text-pretty text-base-400">{body}</p>

        <div className="mt-10 h-14 w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {!joined ? (
              <motion.form
                key="form"
                exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) setJoined(true);
                }}
                className="flex h-14 items-center gap-2 rounded-full bg-base-950 p-1.5 pl-5 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/50 transition-shadow focus-within:ring-base-50/25"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-base-100 outline-none placeholder:text-base-600"
                />
                <button className="group inline-flex h-full items-center gap-2 rounded-full bg-base-50 px-5 text-sm font-medium text-base-950 shadow-md shadow-shade/30 transition-transform active:scale-[0.97]">
                  Join waitlist <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.35 }}
                className="flex h-14 items-center justify-center gap-3 rounded-full bg-emerald-500/10 text-[15px] text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300"
              >
                <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-neutral-950">
                  <Check className="size-3.5" />
                </span>
                You&apos;re on the list. We&apos;ll be in touch.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center gap-3 text-sm text-base-500">
          <div className="flex -space-x-2">
            {faces.map((g) => (
              <span key={g} className={cn("size-7 rounded-full bg-linear-to-br ring-2 ring-canvas", g)} />
            ))}
          </div>
          <span>
            <NumberTicker value={count} className="font-medium text-base-100" /> people already waiting
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <Waitlist />;
}
