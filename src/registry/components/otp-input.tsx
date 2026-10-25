"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "error";

export function OTPInput({
  length = 6,
  onComplete,
  status = "idle",
  className,
  slotClassName,
}: {
  length?: number;
  onComplete?: (code: string) => void;
  status?: Status;
  className?: string;
  /** Classes for each digit box. */
  slotClassName?: string;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const ring = {
    idle: "ring-base-50/10",
    success: "ring-emerald-500/60 bg-emerald-500/5",
    error: "ring-red-500/60 bg-red-500/5",
  }[status];

  return (
    <div data-slot="otp-input" className={cn("relative", className)} onClick={() => input.current?.focus()}>
      <input
        ref={input}
        value={value}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label="One-time code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, length);
          setValue(next);
          if (next.length === length) onComplete?.(next);
        }}
        className="absolute inset-0 opacity-0"
      />
      <div className="flex items-center gap-2">
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const active = focused && (i === value.length || (i === length - 1 && value.length === length));
          return (
            <div key={i} className="flex items-center gap-2">
              {i === length / 2 && <span className="h-px w-3 bg-base-700" />}
              <div
                className={cn(
                  "relative grid h-14 w-11 place-items-center rounded-xl bg-base-950 text-xl font-medium text-base-50 ring-1 inset-shadow-sm inset-shadow-shade/60 transition-all duration-200",
                  active && status === "idle" ? "ring-blue-500/70 outline-4 outline-offset-1 outline-blue-500/15" : ring,
                  slotClassName,
                )}
              >
                <AnimatePresence mode="popLayout">
                  {char && (
                    <motion.span
                      key={char + i}
                      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {char}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !char && (
                  <motion.span
                    className="absolute h-6 w-px bg-base-200"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Demo() {
  const [status, setStatus] = useState<Status>("idle");
  const [key, setKey] = useState(0);
  const [scope, animate] = useAnimate();

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-sm font-medium text-base-100">Check your email</p>
        <p className="mt-1 text-[13px] text-base-500">
          Enter the code we sent. Try <span className="font-mono text-base-300">123456</span>
        </p>
      </div>
      <div ref={scope}>
        <OTPInput
          key={key}
          status={status}
          onComplete={(code) => {
            if (code === "123456") return setStatus("success");
            setStatus("error");
            animate(scope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
            setTimeout(() => {
              setStatus("idle");
              setKey((k) => k + 1);
            }, 900);
          }}
        />
      </div>
      <p className="h-4 text-xs text-base-500">
        {status === "success" ? <span className="text-emerald-600 dark:text-emerald-400">Verified. Welcome back.</span> : status === "error" ? <span className="text-red-600 dark:text-red-400">That code didn&apos;t match.</span> : "Didn't get it? Resend in 0:30"}
      </p>
    </div>
  );
}
