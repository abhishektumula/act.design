"use client";

import { Fragment, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "verifying" | "success" | "error";

const DANGER = "oklch(0.58 0.19 27)";

/**
 * A one-time-code field. Characters rise into their slots and a caret blinks
 * in the next one. Paste or SMS autofill fill every slot at once. When the code
 * is complete it is handed to `onComplete`: the slots ripple while it checks,
 * pop in sequence when it passes, and shake and clear when it doesn't.
 */
export function CodeInput({
  length = 6,
  groupSize = 3,
  mode = "numeric",
  value: controlled,
  defaultValue = "",
  onValueChange,
  onComplete,
  label = "Verification code",
  disabled,
  className,
}: {
  length?: number;
  /** Slots per group; a divider is drawn between groups. 0 for none. */
  groupSize?: number;
  mode?: "numeric" | "alphanumeric";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Return (or resolve to) `true` to accept the code, `false` to reject it. */
  onComplete?: (code: string) => boolean | Promise<boolean>;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState(false);
  const [scope, animate] = useAnimate();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      run.current++;
    },
    [],
  );

  const set = (next: string) => {
    if (controlled === undefined) setInner(next);
    onValueChange?.(next);
  };

  const sanitize = (raw: string) => {
    const chars = mode === "numeric" ? raw.replace(/\D/g, "") : raw.replace(/[^a-z0-9]/gi, "").toUpperCase();
    return chars.slice(0, length);
  };

  const verify = async (code: string) => {
    if (!onComplete) return;
    const ticket = ++run.current;
    setStatus("verifying");
    let ok = false;
    try {
      ok = await onComplete(code);
    } catch {
      ok = false;
    }
    if (ticket !== run.current) return;
    if (ok) {
      setStatus("success");
      navigator.vibrate?.(20);
      input.current?.blur();
      return;
    }
    setStatus("error");
    navigator.vibrate?.([8, 40, 8]);
    animate(scope.current, { x: [0, -8, 8, -5, 5, -2, 0] }, { duration: 0.42 });
    timer.current = setTimeout(() => {
      if (ticket !== run.current) return;
      set("");
      setStatus("idle");
      input.current?.focus();
    }, 900);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (status === "verifying" || status === "success") return;
    if (timer.current) clearTimeout(timer.current);
    run.current++;
    const next = sanitize(e.target.value);
    setStatus("idle");
    set(next);
    if (next.length === length && next !== value) verify(next);
  };

  /** Keep the real caret at the end so typing and backspace always act on the last slot. */
  const pinCaret = () => {
    const el = input.current;
    if (el && (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length)) {
      el.setSelectionRange(el.value.length, el.value.length);
    }
  };

  const locked = disabled || status === "verifying" || status === "success";
  const active = Math.min(value.length, length - 1);

  const message =
    status === "verifying"
      ? { icon: <LoaderCircle className="animate-spin" />, text: "Checking code" }
      : status === "success"
        ? { icon: <Check />, text: "Verified" }
        : status === "error"
          ? { icon: <RotateCcw />, text: "That code didn’t match" }
          : null;

  return (
    <div data-slot="code-input" className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div ref={scope} className="relative">
        <div className="flex items-center gap-2" aria-hidden>
          {Array.from({ length }, (_, i) => {
            const char = value[i];
            const isActive = focused && status === "idle" && i === active && !disabled;
            const caret = isActive && value.length < length;
            const divider = groupSize > 0 && i > 0 && i % groupSize === 0;
            return (
              <Fragment key={i}>
                {divider && <span className="h-0.5 w-2.5 rounded-full bg-base-50/20" />}
                <motion.div
                  animate={
                    status === "verifying"
                      ? { opacity: [1, 0.45, 1], transition: { duration: 0.9, repeat: Infinity, delay: i * 0.08 } }
                      : status === "success"
                        ? { opacity: 1, scale: [1, 1.1, 1], transition: { duration: 0.32, delay: i * 0.045 } }
                        : { opacity: 1, scale: 1 }
                  }
                  style={status === "error" ? { ["--ring" as string]: DANGER } : undefined}
                  className={cn(
                    "relative grid h-14 w-11 place-items-center overflow-hidden rounded-xl bg-base-50/[0.06] font-mono text-2xl font-medium text-base-50 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-base-50/10 transition-[box-shadow,background-color,color] duration-200",
                    isActive && "bg-base-50/[0.03] ring-2 ring-signal/70",
                    status === "success" && "bg-signal/15 text-signal ring-signal/40",
                    status === "error" && "text-(--ring) ring-(--ring)/60",
                    disabled && "opacity-50",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {char && (
                      <motion.span
                        key={char}
                        initial={{ y: "60%", opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: "-40%", opacity: 0, filter: "blur(4px)", position: "absolute" }}
                        transition={{ type: "spring", stiffness: 520, damping: 34 }}
                      >
                        {char}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {caret && (
                    <motion.span
                      animate={{ opacity: [1, 1, 0, 0] }}
                      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
                      className="absolute h-6 w-0.5 rounded-full bg-signal"
                    />
                  )}
                </motion.div>
              </Fragment>
            );
          })}
        </div>

        {/* One real input over the slots: native typing, paste, autofill and screen readers. */}
        <input
          ref={input}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => {
            setFocused(true);
            requestAnimationFrame(pinCaret);
          }}
          onBlur={() => setFocused(false)}
          onSelect={pinCaret}
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
          }}
          readOnly={locked}
          disabled={disabled}
          maxLength={length}
          inputMode={mode === "numeric" ? "numeric" : "text"}
          pattern={mode === "numeric" ? "[0-9]*" : undefined}
          autoComplete="one-time-code"
          autoCapitalize={mode === "alphanumeric" ? "characters" : "off"}
          autoCorrect="off"
          spellCheck={false}
          aria-label={label}
          aria-invalid={status === "error" || undefined}
          aria-describedby={`${id}-status`}
          className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent disabled:cursor-not-allowed"
        />
      </div>

      <div id={`${id}-status`} role="status" aria-live="polite" className="h-5">
        <AnimatePresence mode="wait" initial={false}>
          {message && (
            <motion.span
              key={status}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              style={status === "error" ? { color: DANGER } : undefined}
              className={cn(
                "flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase [&_svg]:size-3.5",
                status === "success" ? "text-signal" : "text-base-500",
              )}
            >
              {message.icon}
              {message.text}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Demo() {
  const [key, setKey] = useState(0);
  const [wait, setWait] = useState(30);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-base-950 px-6 pt-7 pb-5 text-center shadow-[0_1px_0_white_inset,0_20px_40px_-24px_var(--color-shade)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]">
      <p className="text-base font-semibold text-base-50">Check your phone</p>
      <p className="mt-1 text-sm text-balance text-base-500">
        We sent a 6-digit code to •••• 4821. Try <span className="font-mono text-base-300">424242</span>.
      </p>
      <CodeInput
        key={key}
        className="mt-6"
        onComplete={(code) => new Promise((resolve) => setTimeout(() => resolve(code === "424242"), 900))}
      />
      <button
        type="button"
        disabled={wait > 0}
        onClick={() => {
          setKey((k) => k + 1);
          setWait(30);
        }}
        className="mt-2 rounded-md px-2 py-1 text-[13px] font-medium text-base-300 outline-none hover:text-base-50 focus-visible:ring-2 focus-visible:ring-signal/60 disabled:cursor-default disabled:text-base-500 disabled:hover:text-base-500"
      >
        {wait > 0 ? <span className="tabular-nums">Resend code in 0:{String(wait).padStart(2, "0")}</span> : "Resend code"}
      </button>
    </div>
  );
}
