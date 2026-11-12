"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { ArrowRight, AtSign, CornerDownLeft, KeyRound, LoaderCircle } from "lucide-react";
import { signIn } from "@/app/actions";
import { Dial } from "@/components/ui/dial";
import { Keycap } from "@/components/ui/keycap";
import { Input, PasswordInput } from "@/components/site/kit/input";
import { cn } from "@/lib/utils";

const LIGHTS = 12;

/** Every keystroke turns the lock to a new, repeatable position. */
function combination(password: string) {
  if (!password) return 0;
  let h = 7;
  for (const c of password) h = (h * 31 + c.charCodeAt(0)) % 997;
  return 8 + (h % 85);
}

function Screw({ className }: { className: string }) {
  return (
    <span className={cn("absolute size-2.5 rounded-full bg-linear-to-b from-base-800 to-base-700 ring-1 ring-black/10", className)}>
      <span className="absolute inset-x-[2px] top-1/2 h-px -translate-y-1/2 rotate-45 bg-black/25" />
    </span>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [password, setPassword] = useState("");
  /** The result the visitor has already typed past, so an old error clears as they retry. */
  const [seen, setSeen] = useState(state);
  const [form, animateForm] = useAnimate();
  const [lock, animateLock] = useAnimate();

  // A wrong combination: the form shakes and so does the lock.
  useEffect(() => {
    if (!state?.error) return;
    animateForm(form.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
    animateLock(lock.current, { rotate: [0, -4, 4, -2, 2, 0] }, { duration: 0.45 });
  }, [state, animateForm, animateLock, form, lock]);

  const failed = !!state?.error && state !== seen && !pending;
  const status = pending ? "Checking" : failed ? "Wrong combination" : password ? "Dialling" : "Locked";
  const dial = failed ? 0 : combination(password);

  return (
    <div className="grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
      {/* Form */}
      <div>
        <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-base-50 sm:text-6xl">
          Welcome <span className="font-serif font-normal tracking-[-0.02em] italic">back.</span>
        </h1>
        <p className="mt-5 max-w-sm text-lg leading-8 text-pretty text-base-400">Sign in to copy the source of every instrument and block.</p>

        <motion.form ref={form} action={action} className="mt-10 flex max-w-sm flex-col gap-5">
          <input type="hidden" name="next" value={next} />
          <Input label="Email" name="email" type="email" size="lg" icon={<AtSign />} placeholder="you@studio.com" autoComplete="email" required />
          <PasswordInput
            label="Password"
            name="password"
            size="lg"
            icon={<KeyRound />}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSeen(state);
            }}
            error={failed ? state?.error : undefined}
          />
          <Keycap type="submit" tone="signal" size="lg" disabled={pending} legend={!pending && <CornerDownLeft />} className="mt-2 w-full">
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" /> Opening
              </>
            ) : (
              "Sign in"
            )}
          </Keycap>
        </motion.form>

        <p className="mt-8 flex items-center gap-2 text-sm text-base-500">
          No membership yet?
          <Link href="/pricing" className="group inline-flex items-center gap-1 font-medium text-base-100 transition-colors hover:text-signal">
            Get All-Access <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </p>
      </div>

      {/* The lock */}
      <div
        aria-hidden
        className="relative hidden rounded-[36px] bg-base-950 p-2 shadow-[0_1px_0_white_inset,0_50px_90px_-50px_color-mix(in_oklab,var(--color-shade)_90%,transparent)] ring-1 ring-base-50/10 sm:block dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_40px_80px_-30px_black]"
      >
        <Screw className="top-4 left-4" />
        <Screw className="top-4 right-4" />
        <Screw className="bottom-4 left-4" />
        <Screw className="right-4 bottom-4" />
        <div className="flex flex-col items-center rounded-[30px] px-8 pt-10 pb-8 ring-1 ring-base-50/[0.07]">
          <div className="flex w-full justify-end text-xs text-base-500">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  failed ? "bg-red-500 shadow-[0_0_8px_var(--color-red-500)]" : pending ? "animate-pulse bg-signal" : "bg-signal shadow-[0_0_8px_var(--signal)]",
                )}
              />
              {status}
            </span>
          </div>

          <div ref={lock} inert className="pointer-events-none mt-10">
            <Dial size="lg" ticks={51} min={0} max={100} value={dial} label="Combination" format={(v) => String(Math.round(v)).padStart(2, "0")} />
          </div>

          {/* One light per character typed */}
          <div className="mt-10 flex gap-2">
            {Array.from({ length: LIGHTS }, (_, i) => {
              const lit = i < password.length;
              return (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ scale: lit ? 1 : 0.8 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className={cn(
                    "size-2 rounded-full transition-colors duration-150",
                    lit ? (failed ? "bg-red-500" : "bg-signal shadow-[0_0_8px_var(--signal)]") : "bg-base-50/10",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
