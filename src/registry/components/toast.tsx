"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "default" | "success" | "error" | "loading";
type ToastData = { id: number; title: string; description?: string; type: ToastType; action?: { label: string; onClick: () => void } };
type Options = Partial<Omit<ToastData, "id" | "title">>;

// ---- tiny store -------------------------------------------------------------
let toasts: ToastData[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: ToastData[] = [];
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function add(title: string, opts: Options = {}) {
  const id = nextId++;
  const item: ToastData = { id, title, type: "default", ...opts };
  toasts = [item, ...toasts].slice(0, 6);
  emit();
  return id;
}
function update(id: number, patch: Partial<ToastData>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}
export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = Object.assign((title: string, opts?: Options) => add(title, opts), {
  success: (title: string, opts?: Options) => add(title, { ...opts, type: "success" }),
  error: (title: string, opts?: Options) => add(title, { ...opts, type: "error" }),
  promise: async <T,>(promise: Promise<T>, msg: { loading: string; success: string; error: string }) => {
    const id = add(msg.loading, { type: "loading" });
    try {
      const result = await promise;
      update(id, { title: msg.success, type: "success" });
      return result;
    } catch (e) {
      update(id, { title: msg.error, type: "error" });
      throw e;
    }
  },
});

// ---- UI -----------------------------------------------------------------------
const icons = {
  default: <Info className="size-4 text-base-400" />,
  success: <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />,
  error: <XCircle className="size-4 text-red-600 dark:text-red-400" />,
  loading: <Loader2 className="size-4 animate-spin text-base-400" />,
};

const HEIGHT = 64;
const GAP = 10;

const positions = {
  "bottom-right": "right-6 bottom-6",
  "bottom-left": "left-6 bottom-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "top-right": "right-6 top-6",
  "top-center": "top-6 left-1/2 -translate-x-1/2",
};

export type ToastPosition = keyof typeof positions;

function ToastCard({
  t,
  index,
  expanded,
  top,
  className,
}: {
  t: ToastData;
  index: number;
  expanded: boolean;
  top: boolean;
  className?: string;
}) {
  const dir = top ? 1 : -1;
  useEffect(() => {
    if (expanded || t.type === "loading") return;
    const timer = setTimeout(() => dismiss(t.id), 4500);
    return () => clearTimeout(timer);
  }, [t.id, t.type, expanded]);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -dir * 40, scale: 0.95 }}
      animate={{
        opacity: index > 2 && !expanded ? 0 : 1,
        y: dir * (expanded ? index * (HEIGHT + GAP) : index * 12),
        scale: expanded ? 1 : 1 - index * 0.05,
      }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
      style={{ zIndex: 100 - index, height: HEIGHT }}
      data-slot="toast"
      data-type={t.type}
      className={cn(
        "absolute right-0 flex w-full items-center gap-3 rounded-2xl bg-base-900 px-4 shadow-2xl shadow-shade/60 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
        top ? "top-0 origin-top" : "bottom-0 origin-bottom",
        className,
      )}
    >
      {icons[t.type]}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-base-100">{t.title}</p>
        {t.description && <p className="truncate text-xs text-base-500">{t.description}</p>}
      </div>
      {t.action && (
        <button
          onClick={() => {
            t.action!.onClick();
            dismiss(t.id);
          }}
          className="h-7 rounded-lg bg-base-50 px-2.5 text-xs font-medium text-base-950"
        >
          {t.action.label}
        </button>
      )}
      <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-base-600 transition-colors hover:text-base-200">
        <X className="size-3.5" />
      </button>
    </motion.li>
  );
}

export function Toaster({
  position = "bottom-right",
  className,
  toastClassName,
}: {
  position?: ToastPosition;
  className?: string;
  toastClassName?: string;
}) {
  const top = position.startsWith("top");
  const items = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [expanded, setExpanded] = useState(false);

  if (!mounted) return null;

  return createPortal(
    <ol
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      className={cn("fixed z-50 w-[22rem]", positions[position], !items.length && "pointer-events-none", className)}
      style={{ height: expanded ? items.length * (HEIGHT + GAP) : HEIGHT + 24 }}
    >
      <AnimatePresence initial={false}>
        {items.map((t, i) => (
          <ToastCard key={t.id} t={t} index={i} expanded={expanded} top={top} className={toastClassName} />
        ))}
      </AnimatePresence>
    </ol>,
    document.body,
  );
}

export default function Demo() {
  const btn =
    "h-9 rounded-xl bg-linear-to-b from-base-800 to-base-900 px-3.5 text-sm text-base-100 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 transition-transform active:scale-[0.97]";
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button className={btn} onClick={() => toast("Event created", { description: "Friday, Oct 24 at 9:00 AM" })}>
        Default
      </button>
      <button className={btn} onClick={() => toast.success("Changes saved")}>
        Success
      </button>
      <button className={btn} onClick={() => toast.error("Payment failed", { description: "Your card was declined." })}>
        Error
      </button>
      <button
        className={btn}
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 1800)), {
            loading: "Deploying to production…",
            success: "Deployed in 18s",
            error: "Deploy failed",
          })
        }
      >
        Promise
      </button>
      <button className={btn} onClick={() => toast("Message archived", { action: { label: "Undo", onClick: () => toast.success("Restored") } })}>
        Action
      </button>
      <Toaster />
    </div>
  );
}
