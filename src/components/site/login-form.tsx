"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { ArrowRight, AtSign, KeyRound, LoaderCircle } from "lucide-react";
import { signIn } from "@/app/actions";
import { Dial } from "@/components/ui/dial";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/site/kit/input";
import { cn } from "@/lib/utils";
import { Crosses, Eyebrow, PanelBar } from "./frame";

const LIGHTS = 12;

/** Every keystroke turns the lock to a new, repeatable position. */
function combination(password: string) {
  if (!password) return 0;
  let h = 7;
  for (const c of password) h = (h * 31 + c.charCodeAt(0)) % 997;
  return 8 + (h % 85);
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
        <Eyebrow>Sign in</Eyebrow>
        <h1 className="mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-base-50 sm:text-6xl">
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
          <Button type="submit" tone="signal" size="lg" disabled={pending} className="mt-2 w-full rounded-md">
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" /> Opening
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </motion.form>

        <p className="mt-8 flex items-center gap-2 text-sm text-base-500">
          No membership yet?
          <Link href="/pricing" className="group inline-flex items-center gap-1 font-medium text-base-100 transition-colors hover:text-signal">
            Get All-Access <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </p>
      </div>

      {/* The lock */}
      <div aria-hidden className="relative hidden sm:block">
        <Crosses />
        <div className="overflow-hidden bg-base-950 ring-1 ring-base-50/[0.08]">
          <PanelBar label="Combination lock">
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-base-400 uppercase">
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  failed ? "bg-red-500 shadow-[0_0_8px_var(--color-red-500)]" : pending ? "animate-pulse bg-signal" : "bg-signal shadow-[0_0_8px_var(--signal)]",
                )}
              />
              {status}
            </span>
          </PanelBar>
          <div className="relative flex flex-col items-center px-8 pt-6 pb-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--base-800)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] opacity-60" />
          <div ref={lock} inert className="pointer-events-none relative mt-6">
            <Dial size="lg" ticks={51} min={0} max={100} value={dial} label="Combination" format={(v) => String(Math.round(v)).padStart(2, "0")} />
          </div>

          {/* One light per character typed */}
          <div className="relative mt-10 flex gap-2">
            {Array.from({ length: LIGHTS }, (_, i) => {
              const lit = i < password.length;
              return (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ scale: lit ? 1 : 0.8 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className={cn(
                    "h-3 w-1 rounded-[1px] transition-colors duration-150",
                    lit ? (failed ? "bg-red-500" : "bg-signal shadow-[0_0_8px_var(--signal)]") : "bg-base-50/10",
                  )}
                />
              );
            })}
          </div>
          </div>
          <div className="flex justify-between border-t border-base-50/[0.06] px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase">
            <span>{String(Math.min(password.length, LIGHTS)).padStart(2, "0")} / {LIGHTS}</span>
            <span>pos {String(dial).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
