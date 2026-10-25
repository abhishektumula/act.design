"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { AtSign, Eye, EyeOff, KeyRound, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "group flex items-center gap-2.5 transition-[box-shadow,background-color,border-color] duration-200 [&_svg]:size-4 data-[error=true]:ring-red-500/60 data-[error=true]:focus-within:outline-red-500/15",
  {
    variants: {
      variant: {
        // recessed field with an inner shadow
        inset:
          "rounded-xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/60 focus-within:bg-base-900/60 focus-within:ring-blue-500/60 focus-within:outline-4 focus-within:outline-offset-1 focus-within:outline-blue-500/15",
        // raised surface, like a secondary button
        raised:
          "rounded-xl bg-linear-to-b from-base-800 to-base-900 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 shadow-md shadow-shade/40 focus-within:ring-blue-500/60",
        // just a bottom border — for minimal forms
        underline:
          "rounded-none border-b border-base-50/15 px-0! focus-within:border-base-200 data-[error=true]:border-red-500/60",
      },
      size: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-[15px]",
      },
    },
    defaultVariants: { variant: "inset", size: "md" },
  },
);

type Slots = { root?: string; label?: string; field?: string; input?: string; error?: string };

export type InputProps = Omit<ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    label?: string;
    icon?: ReactNode;
    error?: string;
    trailing?: ReactNode;
    classNames?: Slots;
  };

export function Input({ label, icon, error, trailing, variant, size, className, classNames, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div data-slot="input" className={cn("flex flex-col gap-1.5", className, classNames?.root)}>
      {label && (
        <label htmlFor={inputId} className={cn("text-[13px] font-medium text-base-300", classNames?.label)}>
          {label}
        </label>
      )}
      <div data-error={!!error} className={cn(inputVariants({ variant, size }), classNames?.field)}>
        {icon && <span className="text-base-500 transition-colors group-focus-within:text-base-200">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={cn("h-full min-w-0 flex-1 bg-transparent text-base-100 outline-none placeholder:text-base-600", classNames?.input)}
          {...props}
        />
        {trailing}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            className={cn("text-xs text-red-600 dark:text-red-400", classNames?.error)}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PasswordInput(props: Omit<InputProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="-mr-1 grid size-7 place-items-center rounded-md text-base-500 transition-colors hover:bg-base-50/5 hover:text-base-200"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={String(visible)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {visible ? <EyeOff /> : <Eye />}
            </motion.span>
          </AnimatePresence>
        </button>
      }
    />
  );
}

export default function Demo() {
  const [scope, animate] = useAnimate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string>();

  return (
    <form
      ref={scope}
      onSubmit={(e) => {
        e.preventDefault();
        if (username.trim().length < 3) {
          setError("Pick a username with at least 3 characters.");
          animate(scope.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.4 });
        } else setError(undefined);
      }}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <Input variant="raised" size="sm" icon={<Search />} placeholder="Search… (raised, sm)" />
      <Input label="Email" icon={<AtSign />} type="email" placeholder="you@studio.com" />
      <PasswordInput label="Password" icon={<KeyRound />} placeholder="••••••••" />
      <Input
        label="Username"
        variant="underline"
        icon={<User />}
        placeholder="abhishek"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
      />
      <button className="mt-1 h-10 rounded-xl bg-linear-to-b from-base-50 to-base-200 text-sm font-medium text-base-950 ring-1 ring-base-50/60 inset-shadow-2xs inset-shadow-white transition-transform active:scale-[0.98]">
        Create account
      </button>
    </form>
  );
}
