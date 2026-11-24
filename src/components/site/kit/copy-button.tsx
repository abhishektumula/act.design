"use client";

import { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export const copyButtonVariants = cva(
  "relative inline-grid shrink-0 place-items-center text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 active:scale-95",
  {
    variants: {
      variant: {
        ghost: "hover:bg-neutral-950/5 dark:hover:bg-neutral-50/5",
        outline: "ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 hover:bg-neutral-950/5 dark:hover:bg-neutral-50/5",
        raised: "bg-neutral-100 dark:bg-neutral-900 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 hover:ring-neutral-950/20 dark:hover:ring-neutral-50/20",
      },
      size: {
        sm: "size-7 rounded-[4px] [&_svg]:size-3.5",
        md: "size-8 rounded-md [&_svg]:size-3.5",
        lg: "size-10 rounded-md [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export function CopyButton({
  value,
  className,
  variant,
  size,
  timeout = 1600,
}: VariantProps<typeof copyButtonVariants> & { value: string; className?: string; timeout?: number }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), timeout);
    return () => clearTimeout(t);
  }, [copied, timeout]);

  return (
    <button
      data-slot="copy-button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(copyButtonVariants({ variant, size }), className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          {copied ? <Check className="text-emerald-600 dark:text-emerald-400" /> : <Copy />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="flex w-full items-center gap-3 rounded-md bg-neutral-50 dark:bg-neutral-950 py-1 pr-1 pl-4 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10">
        <span className="text-neutral-400 dark:text-neutral-600 select-none">$</span>
        <code className="flex-1 truncate font-mono text-sm text-neutral-800 dark:text-neutral-200">npm i motion lucide-react</code>
        <CopyButton value="npm i motion lucide-react" />
      </div>
      <div className="flex gap-3">
        <CopyButton value="sm" size="sm" variant="outline" />
        <CopyButton value="md" variant="outline" />
        <CopyButton value="lg" size="lg" variant="raised" />
      </div>
    </div>
  );
}
