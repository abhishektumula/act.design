"use client";

import { useActionState, useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { AtSign, KeyRound, Loader2 } from "lucide-react";
import { signIn } from "@/app/actions";
import { Input, PasswordInput } from "@/components/site/kit/input";
import { btnPrimary } from "./styles";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (state?.error) animate(scope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
  }, [state, animate, scope]);

  return (
    <motion.form ref={scope} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Input label="Email" name="email" type="email" icon={<AtSign />} placeholder="you@studio.com" autoComplete="email" required />
      <PasswordInput
        label="Password"
        name="password"
        icon={<KeyRound />}
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={state?.error}
      />
      <button disabled={pending} className={`${btnPrimary} mt-2 h-11 rounded-xl text-sm disabled:opacity-80`}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </button>
    </motion.form>
  );
}
