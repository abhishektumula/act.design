"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Link2, Mail, MessageCircle, Send, Share } from "lucide-react";
import { cn } from "@/lib/utils";

const noop = () => () => {};

export function Drawer({
  open,
  onClose,
  children,
  className,
  overlayClassName,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 bg-black/60 backdrop-blur-[2px]", overlayClassName)}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            data-slot="drawer"
            className={cn("absolute inset-x-0 bottom-0 mx-auto max-w-lg cursor-grab rounded-t-3xl bg-base-900 px-6 pt-3 pb-10 shadow-2xl shadow-shade ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 active:cursor-grabbing", className)}
          >
            <div className="mx-auto mb-6 h-1.5 w-10 rounded-full bg-base-700" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const targets = [
  { label: "Copy link", icon: Link2 },
  { label: "Messages", icon: MessageCircle },
  { label: "Mail", icon: Mail },
  { label: "Telegram", icon: Send },
];

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-xl bg-linear-to-b from-base-800 to-base-900 px-4 text-sm font-medium text-base-100 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 transition-transform active:scale-[0.97]"
      >
        <Share className="size-4" /> Share
      </button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold tracking-tight text-base-50">Share this component</h2>
        <p className="mt-1 text-sm text-base-500">Drag down or tap outside to dismiss.</p>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {targets.map(({ label, icon: Icon }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-2 rounded-2xl py-3 text-xs text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-b from-base-700 to-base-800 text-base-100 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15">
                <Icon className="size-5" />
              </span>
              {label}
            </motion.button>
          ))}
        </div>
      </Drawer>
    </>
  );
}
