"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type PanInfo } from "motion/react";
import { Check, CircleAlert, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- store ---------------------------------- */

type Kind = "default" | "success" | "error" | "loading";

export type ToastOptions = {
  /** A second, quieter line under the title. */
  description?: ReactNode;
  /** One button on the ticket. The ticket tears off once it is clicked. */
  action?: { label: ReactNode; onClick: () => void };
  /** Milliseconds before it leaves. `Infinity` keeps it until dismissed. */
  duration?: number;
  /** Pass an existing id to reprint that ticket instead of adding one. */
  id?: string;
};

type Ticket = Omit<ToastOptions, "id"> & { id: string; kind: Kind; title: ReactNode; version: number };

let tickets: Ticket[] = [];
let count = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => tickets;
const empty: Ticket[] = [];

function print(kind: Kind, title: ReactNode, { id, ...options }: ToastOptions = {}) {
  const key = id ?? `toast-${++count}`;
  const existing = tickets.find((t) => t.id === key);
  tickets = existing
    ? tickets.map((t) => (t.id === key ? { ...t, ...options, kind, title, version: t.version + 1 } : t))
    : [{ ...options, id: key, kind, title, version: 0 }, ...tickets];
  emit();
  return key;
}

/** Reprints a ticket that is still out; does nothing once it has been torn off. */
function reprint(id: string, kind: Kind, title: ReactNode, options?: ToastOptions) {
  if (tickets.some((t) => t.id === id)) print(kind, title, { ...options, id });
}

type Message<T> = ReactNode | ((value: T) => ReactNode);
const resolve = <T,>(message: Message<T>, value: T) => (typeof message === "function" ? message(value) : message);

/** Prints a ticket. Returns its id. */
export function toast(title: ReactNode, options?: ToastOptions) {
  return print("default", title, options);
}
toast.success = (title: ReactNode, options?: ToastOptions) => print("success", title, options);
toast.error = (title: ReactNode, options?: ToastOptions) => print("error", title, options);
/** Stays out until you reprint it (same `id`) or dismiss it. */
toast.loading = (title: ReactNode, options?: ToastOptions) => print("loading", title, options);
/** One ticket that reads loading while the promise runs, then reprints itself as success or error. */
toast.promise = <T,>(
  promise: Promise<T>,
  messages: { loading: ReactNode; success: Message<T>; error: Message<unknown> },
  options?: Omit<ToastOptions, "id">,
) => {
  const id = print("loading", messages.loading, options);
  promise.then(
    (value) => reprint(id, "success", resolve(messages.success, value), options),
    (error) => reprint(id, "error", resolve(messages.error, error), options),
  );
  return promise;
};
/** Dismisses one ticket, or every ticket when called without an id. */
toast.dismiss = (id?: string) => {
  tickets = id ? tickets.filter((t) => t.id !== id) : [];
  emit();
};

/* --------------------------------- toaster --------------------------------- */

const PEEK = 12; // how much of each older ticket shows above the front one
const GAP = 10; // space between tickets when the pile fans out
const TEAR_DISTANCE = 90;
const TEAR_VELOCITY = 600;

const springy = { type: "spring", stiffness: 420, damping: 36 } as const;

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

const corners: Record<ToasterPosition, string> = {
  "top-left": "top-6 left-6",
  "top-center": "top-6 left-1/2 -translate-x-1/2",
  "top-right": "top-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-6",
};

function useDocumentHidden() {
  return useSyncExternalStore(
    (callback) => {
      document.addEventListener("visibilitychange", callback);
      return () => document.removeEventListener("visibilitychange", callback);
    },
    () => document.hidden,
    () => false,
  );
}

/**
 * Where tickets print. Render it once, near the root; call `toast()` from anywhere.
 *
 * Each ticket feeds out of a slot at the screen's edge in short mechanical
 * bursts, and pushes the older ones back into a pile. Hover or focus the pile
 * and it fans out and every timer stops. Tear a ticket off sideways to dismiss
 * it: a flick sends it, a slow drag snaps back. Alt+T focuses the newest
 * ticket and Escape dismisses the focused one.
 */
export function Toaster({
  position = "bottom-right",
  duration = 4000,
  visible = 3,
  className,
}: {
  position?: ToasterPosition;
  /** Default milliseconds before a ticket leaves. Loading tickets wait. */
  duration?: number;
  /** How many tickets are out at once. The rest queue and print as room frees up. */
  visible?: number;
  className?: string;
}) {
  const all = useSyncExternalStore(subscribe, snapshot, () => empty);
  const out = all.slice(0, visible);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hidden = useDocumentHidden();
  const list = useRef<HTMLOListElement>(null);
  const bottom = position.startsWith("bottom");
  const expanded = (hovered || focused) && out.length > 0;

  // Alt+T jumps to the newest ticket
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyT") {
        e.preventDefault();
        list.current?.querySelector<HTMLElement>("[data-ticket]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Once the last ticket goes, the pile can't stay open under a pointer that left it
  const [wasEmpty, setWasEmpty] = useState(true);
  if (wasEmpty !== (out.length === 0)) {
    setWasEmpty(out.length === 0);
    if (out.length === 0) {
      setHovered(false);
      setFocused(false);
    }
  }

  const height = (id: string) => heights[id] ?? 0;
  const front = out[0] ? height(out[0].id) : 0;
  const offsets = out.map((_, depth) => (expanded ? out.slice(0, depth).reduce((sum, t) => sum + height(t.id) + GAP, 0) : depth * PEEK));
  const total = out.length === 0 ? 0 : expanded ? offsets[out.length - 1] + height(out[out.length - 1].id) : front + (out.length - 1) * PEEK;

  return (
    <section
      aria-label="Notifications (Alt+T)"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        "pointer-events-none fixed z-100 w-[360px] max-sm:inset-x-4 max-sm:w-auto max-sm:translate-x-0",
        corners[position],
        className,
      )}
    >
      <motion.ol
        ref={list}
        initial={false}
        animate={{ height: total }}
        transition={springy}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
        className={cn("relative", out.length > 0 && "pointer-events-auto")}
      >
        <AnimatePresence initial={false}>
          {out.map((ticket, depth) => (
            <TicketView
              key={ticket.id}
              ticket={ticket}
              depth={depth}
              offset={offsets[depth]}
              frontHeight={front}
              expanded={expanded}
              bottom={bottom}
              paused={expanded || hidden}
              duration={ticket.duration ?? duration}
              onHeight={(h) => setHeights((prev) => (prev[ticket.id] === h ? prev : { ...prev, [ticket.id]: h }))}
            />
          ))}
        </AnimatePresence>

        {/* The slot the tickets feed out of */}
        <AnimatePresence>
          {out.length > 0 && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.7 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "absolute -inset-x-2 z-60 h-1.5 rounded-full bg-base-700 inset-shadow-xs inset-shadow-black/25 dark:bg-base-800 dark:inset-shadow-black",
                bottom ? "-bottom-[3px]" : "-top-[3px]",
              )}
            />
          )}
        </AnimatePresence>
      </motion.ol>
    </section>
  );
}

/* --------------------------------- ticket ---------------------------------- */

const icons: Record<Kind, ReactNode> = {
  default: null,
  success: (
    <span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white">
      <Check className="size-3" strokeWidth={3} />
    </span>
  ),
  error: <CircleAlert className="size-5 fill-red-600 text-white dark:text-black" />,
  loading: <LoaderCircle className="size-5 animate-spin text-base-500" />,
};

function TicketView({
  ticket,
  depth,
  offset,
  frontHeight,
  expanded,
  bottom,
  paused,
  duration,
  onHeight,
}: {
  ticket: Ticket;
  depth: number;
  offset: number;
  frontHeight: number;
  expanded: boolean;
  bottom: boolean;
  paused: boolean;
  duration: number;
  onHeight: (height: number) => void;
}) {
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(0);
  const [torn, setTorn] = useState(false);
  const side = bottom ? 1 : -1;

  // Feeding: 1 is still inside the slot, 0 is all the way out
  const feed = useMotionValue(reduced ? 0 : 1);
  const tall = useMotionValue(0);
  const y = useTransform<number, number>([feed, tall], ([f, h]) => side * f * h);
  const clipPath = useTransform<number, string>([feed, tall], ([f, h]) =>
    f <= 0 ? "none" : bottom ? `inset(-24px -24px ${f * h}px -24px)` : `inset(${f * h}px -24px -24px -24px)`,
  );

  // Tearing: dragged sideways, pivoting on the edge still in the slot
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], reduced ? [0, 0] : [-side * 9, side * 9]);

  // Time left, 1 to 0. Drawn as the tear line burning down.
  const life = useMotionValue(1);
  const timed = ticket.kind !== "loading" && Number.isFinite(duration);

  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    const measure = () => {
      const h = node.offsetHeight;
      tall.set(h);
      setOwn(h);
      onHeight(h);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Feed out of the slot in three bursts, the way a printer advances paper
  useLayoutEffect(() => {
    if (reduced) return;
    const run = animate(feed, [1, 0.58, 0.58, 0.24, 0.24, 0], {
      duration: 0.62,
      times: [0, 0.22, 0.38, 0.6, 0.74, 1],
      ease: ["easeOut", "linear", "easeOut", "linear", [0.2, 0.9, 0.3, 1]],
    });
    return () => run.stop();
  }, [feed, reduced]);

  // Reprinted (promise settled, same id): a full life again
  useEffect(() => {
    life.set(1);
  }, [ticket.version, ticket.kind, life]);

  useEffect(() => {
    if (!timed || paused || torn) return;
    const run = animate(life, 0, {
      duration: (life.get() * duration) / 1000,
      ease: "linear",
      onComplete: () => toast.dismiss(ticket.id),
    });
    return () => run.stop();
  }, [timed, paused, torn, duration, life, ticket.id, ticket.version]);

  const tear = (dir: 1 | -1, velocity = 0) => {
    setTorn(true);
    const width = content.current?.offsetWidth ?? 360;
    animate(x, dir * (width + 120), {
      type: "spring",
      velocity,
      stiffness: 260,
      damping: 32,
      restDelta: 20,
      onComplete: () => toast.dismiss(ticket.id),
    });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = (info.offset.x + info.velocity.x * 0.15 >= 0 ? 1 : -1) as 1 | -1;
    if (Math.abs(info.offset.x) > TEAR_DISTANCE || Math.abs(info.velocity.x) > TEAR_VELOCITY) tear(dir, info.velocity.x);
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 30 });
  };

  const live = depth === 0 || expanded;
  const tucked = !expanded && depth > 0;

  return (
    <motion.li
      layout={false}
      initial={false}
      animate={{
        y: -side * offset,
        scale: tucked ? 1 - depth * 0.05 : 1,
        opacity: 1,
      }}
      exit={torn ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, scale: 0.94, filter: "blur(2px)", transition: { duration: 0.2 } }}
      transition={reduced ? { duration: 0 } : springy}
      style={{ zIndex: 50 - depth, transformOrigin: bottom ? "50% 0%" : "50% 100%" }}
      className={cn("absolute inset-x-0", bottom ? "bottom-0" : "top-0")}
    >
      <motion.div
        data-ticket
        tabIndex={live ? 0 : -1}
        role={ticket.kind === "error" ? "alert" : undefined}
        aria-atomic
        drag={live ? "x" : false}
        dragMomentum={false}
        dragElastic={0.6}
        onDragEnd={onDragEnd}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            const next = (e.currentTarget.closest("li")?.nextElementSibling ?? e.currentTarget.closest("li")?.previousElementSibling)?.querySelector<HTMLElement>("[data-ticket]");
            next?.focus();
            tear(1);
          }
        }}
        initial={false}
        animate={{ height: own === 0 ? "auto" : tucked ? frontHeight : own }}
        transition={reduced ? { duration: 0 } : springy}
        style={{ x, y, rotate, clipPath, transformOrigin: bottom ? "50% 100%" : "50% 0%" }}
        className={cn(
          "group relative touch-pan-y overflow-hidden rounded-2xl bg-white shadow-lg ring-1 shadow-black/[0.08] ring-base-50/[0.08] outline-none select-none focus-visible:ring-2 focus-visible:ring-signal/60 dark:bg-base-900 dark:shadow-black/40",
          live ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
        )}
      >
        <div ref={content} className={cn("transition-opacity duration-200", tucked && "opacity-0")}>
          <div className={cn("flex items-start gap-3 py-3.5 pr-10 pl-4", bottom ? "pb-5" : "pt-5")}>
            <AnimatePresence mode="popLayout" initial={false}>
              {icons[ticket.kind] && (
                <motion.span
                  key={ticket.kind}
                  initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                  className="mt-px flex shrink-0"
                >
                  {icons[ticket.kind]}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={ticket.version}
                  initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="text-sm leading-5 font-medium text-pretty text-base-50"
                >
                  {ticket.title}
                </motion.p>
              </AnimatePresence>
              {ticket.description && <p className="mt-0.5 text-[13px] leading-5 text-pretty text-base-400">{ticket.description}</p>}
            </div>
            {ticket.action && (
              <button
                type="button"
                onPointerDownCapture={(e) => e.stopPropagation()}
                onClick={() => {
                  ticket.action?.onClick();
                  tear(1);
                }}
                className="-my-0.5 h-7 shrink-0 cursor-pointer rounded-lg bg-base-50 px-2.5 text-[13px] font-medium text-base-950 transition-colors outline-none hover:bg-base-200 focus-visible:ring-2 focus-visible:ring-signal/60"
              >
                {ticket.action.label}
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Dismiss"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClick={() => tear(1)}
            className="absolute top-2.5 right-2.5 grid size-6 cursor-pointer place-items-center rounded-md text-base-500 opacity-0 transition-[opacity,color,background-color] outline-none group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-base-50/[0.06] hover:text-base-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-signal/60 max-sm:opacity-100"
          >
            <X className="size-3.5" />
          </button>

          {/* The perforation at the slot edge, burning down as time runs out */}
          <TearLine life={life} timed={timed} bottom={bottom} />
        </div>
      </motion.div>
    </motion.li>
  );
}

function TearLine({ life, timed, bottom }: { life: MotionValue<number>; timed: boolean; bottom: boolean }) {
  const dashes = "bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_7px)]";
  return (
    <span aria-hidden className={cn("absolute inset-x-4 h-px", bottom ? "bottom-2" : "top-2")}>
      <span className={cn("absolute inset-0 text-base-50/[0.12]", dashes)} />
      {timed && <motion.span style={{ scaleX: life }} className={cn("absolute inset-0 origin-left text-base-50/40", dashes)} />}
    </span>
  );
}

/* ----------------------------------- demo ---------------------------------- */

const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

function DemoButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 cursor-pointer rounded-[10px] bg-base-950 px-3.5 text-[13px] font-medium text-base-100 shadow-sm ring-1 shadow-black/[0.06] ring-base-50/10 transition-colors outline-none select-none hover:bg-base-900 focus-visible:ring-2 focus-visible:ring-signal/50 active:bg-base-800 dark:bg-base-900 dark:hover:bg-base-800"
    >
      {children}
    </button>
  );
}

export default function Demo() {
  return (
    <div className="relative flex h-[30rem] w-full max-w-xl items-center justify-center">
      <div className="-mt-40 flex flex-wrap sm:-mt-24 justify-center gap-2">
        <DemoButton
          onClick={() =>
            toast.success("Changes saved", {
              description: "Your profile is up to date.",
              action: { label: "Undo", onClick: () => toast("Changes undone") },
            })
          }
        >
          Save
        </DemoButton>
        <DemoButton
          onClick={() =>
            toast.promise(wait(2200), { loading: "Deploying to production…", success: "Deployed in 2.2s", error: "Deploy failed" }, { description: "main · 3f58eef" })
          }
        >
          Deploy
        </DemoButton>
        <DemoButton onClick={() => toast.error("Payment declined", { description: "The card ending 4242 was declined." })}>Charge card</DemoButton>
        <DemoButton onClick={() => toast("Link copied")}>Copy link</DemoButton>
      </div>
      <Toaster position="bottom-center" className="absolute bottom-4 max-sm:inset-x-0" />
    </div>
  );
}
