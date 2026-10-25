"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const noop = () => () => {};

export const dialogVariants = cva(
  "relative w-full bg-base-900 shadow-2xl shadow-shade ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
  {
    variants: {
      size: {
        sm: "max-w-sm rounded-2xl p-5",
        md: "max-w-md rounded-2xl p-6",
        lg: "max-w-2xl rounded-3xl p-8",
        full: "h-[calc(100svh-2rem)] max-w-none rounded-3xl p-8",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type DialogProps = VariantProps<typeof dialogVariants> & {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  hideClose?: boolean;
};

export function Dialog({ open, onClose, children, size, className, overlayClassName, hideClose }: DialogProps) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={cn("absolute inset-0 bg-black/70 backdrop-blur-sm", overlayClassName)}
          />
          <motion.div
            role="dialog"
            aria-modal
            data-slot="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, y: 6, filter: "blur(4px)" }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
            className={cn(dialogVariants({ size }), className)}
          >
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 grid size-7 place-items-center rounded-lg text-base-500 transition-colors hover:bg-base-50/5 hover:text-base-100"
              >
                <X className="size-4" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const project = "acme-web";
  const close = () => {
    setOpen(false);
    setName("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-10 rounded-xl bg-linear-to-b from-base-800 to-base-900 px-4 text-sm font-medium text-base-100 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 transition-transform active:scale-[0.97]"
      >
        Delete project
      </button>
      <Dialog open={open} onClose={close}>
        <div className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20">
          <AlertTriangle className="size-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-base-50">Delete {project}?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-base-400">
          This permanently removes the project, its deployments and 14 environment variables. This can&apos;t be undone.
        </p>
        <label className="mt-5 block text-[13px] text-base-400">
          Type <span className="font-mono text-base-200">{project}</span> to confirm
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-10 w-full rounded-xl bg-base-950 px-3 font-mono text-sm text-base-100 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/60 outline-none focus:ring-red-500/50"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={close} className="h-9 rounded-xl px-4 text-sm text-base-300 transition-colors hover:bg-base-50/5">
            Cancel
          </button>
          <button
            disabled={name !== project}
            onClick={close}
            className="h-9 rounded-xl bg-linear-to-b from-red-500 to-red-600 px-4 text-sm font-medium text-white shadow-lg shadow-red-600/20 ring-1 ring-red-600 inset-shadow-2xs inset-shadow-white/25 transition-[opacity,transform] active:scale-[0.97] disabled:opacity-40"
          >
            Delete forever
          </button>
        </div>
      </Dialog>
    </>
  );
}
