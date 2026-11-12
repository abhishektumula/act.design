"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CornerDownLeft, Mail } from "lucide-react";
import { Keycap } from "@/components/ui/keycap";
import { RollingNumber } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const WORD = "SOON";

/** A row of keys that types the word out, over and over, like someone's at the desk. */
function TypingKeys() {
  const [down, setDown] = useState(-1);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      // Four presses, then a beat of rest.
      setDown(i < WORD.length ? i : -1);
      i = (i + 1) % (WORD.length + 3);
    }, 380);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex justify-center gap-2.5" aria-hidden>
      {WORD.split("").map((c, i) => (
        <motion.span
          key={i}
          animate={{ paddingBottom: down === i ? 0 : 5, y: down === i ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 900, damping: 32 }}
          className="relative inline-flex rounded-[14px] bg-base-700 dark:bg-black"
        >
          <span
            className={cn(
              "grid size-14 place-items-center rounded-[13px] font-mono text-xl font-medium ring-1 ring-black/10 transition-colors sm:size-16",
              "bg-linear-to-b from-white to-base-900 text-base-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] dark:from-base-700 dark:to-base-800 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]",
              down === i && "text-signal",
            )}
          >
            {c}
          </span>
          <motion.span
            animate={{ opacity: down === i ? 1 : 0 }}
            className="absolute -bottom-3 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]"
          />
        </motion.span>
      ))}
    </div>
  );
}

/**
 * A launch waitlist: self-typing keys, an email well with a real keycap for a
 * submit button, and a place in line that rolls into view once you join.
 */
export function WaitlistKeys({ count = 2480, className }: { count?: number; className?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [waiting, setWaiting] = useState(count);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state !== "idle" || !email.includes("@")) return;
    setState("busy");
    setTimeout(() => {
      setWaiting((w) => w + 1);
      setState("done");
    }, 900);
  };

  return (
    <section data-slot="waitlist-keys" className={cn("relative overflow-hidden bg-canvas px-6 py-28 sm:py-36", className)}>
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[760px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--signal)_14%,transparent),transparent)]" />
      <div className="relative mx-auto max-w-2xl text-center">
        <TypingKeys />
        <h2 className="mt-14 text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-7xl">
          Get on the <span className="font-serif font-normal tracking-[-0.02em] text-signal italic">early list.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-pretty text-base-400">
          We let people in a few hundred at a time, in the order they joined. No spam, one email when it&apos;s your turn.
        </p>

        <div className="mx-auto mt-10 max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {state !== "done" ? (
              <motion.form
                key="form"
                onSubmit={submit}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                className="flex items-center gap-2 rounded-[20px] bg-base-50/[0.05] p-1.5 pl-4 shadow-[inset_0_2px_4px_rgb(0_0_0/0.1)] ring-1 ring-base-50/[0.07] transition-shadow focus-within:ring-signal/40"
              >
                <Mail className="size-4 shrink-0 text-base-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  aria-label="Email address"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-base-50 outline-none placeholder:text-base-500"
                />
                <Keycap type="submit" tone="signal" legend={state === "idle" && <CornerDownLeft />} disabled={state === "busy"}>
                  {state === "busy" ? "Joining" : "Join"}
                </Keycap>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex items-center justify-between gap-4 rounded-[20px] bg-base-950 py-3 pr-3 pl-5 text-left shadow-[0_1px_0_white_inset,0_20px_40px_-24px_var(--color-shade)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]"
              >
                <div>
                  <p className="text-sm font-medium text-base-50">You&apos;re in line.</p>
                  <p className="text-[13px] text-base-500">We&apos;ll write to {email}</p>
                </div>
                <span className="flex items-center gap-2 rounded-xl bg-signal px-3 py-2 font-mono text-sm font-medium text-white">
                  <Check className="size-4" /> #<RollingNumber value={waiting.toLocaleString("en-US")} />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-sm text-base-500">
            <RollingNumber value={waiting.toLocaleString("en-US")} /> people waiting
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <WaitlistKeys />;
}
