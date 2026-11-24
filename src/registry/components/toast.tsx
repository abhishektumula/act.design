"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type PanInfo } from "motion/react";
import { Check, X } from "lucide-react";
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
 * Each ticket rolls out of a slot at the screen's edge and its words type in
 * behind a caret, like a sheet in a typewriter. New tickets push the older
 * ones back into a pile. Hover or focus the pile and it fans out and every timer stops. Tear a ticket off sideways to dismiss
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
                "absolute -inset-x-2 z-60 h-1.5 rounded-full bg-neutral-300 inset-shadow-xs inset-shadow-black/25 dark:bg-neutral-800 dark:inset-shadow-black",
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

/** The declined mark: a red badge whose cross draws itself stroke by stroke, then shakes its head. */
function DeclineMark({ still }: { still?: boolean }) {
  const stroke = (delay: number) =>
    still ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.2, delay, ease: "easeOut" as const } };
  return (
    <motion.span
      initial={false}
      animate={still ? undefined : { x: [0, -3, 3, -2, 2, 0] }}
      transition={{ duration: 0.42, delay: 0.62, ease: "easeInOut" }}
      className="grid size-5 place-items-center rounded-full bg-red-600 text-white"
    >
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="size-2.5">
        <motion.path d="M3 3l6 6" {...stroke(0.2)} />
        <motion.path d="M9 3l-6 6" {...stroke(0.4)} />
      </svg>
    </motion.span>
  );
}

/** The approved mark: a rubber stamp that slams down, leaves a ring of ink, then the tick is drawn in. */
function StampMark({ still, delay = 0 }: { still?: boolean; delay?: number }) {
  if (still)
    return (
      <span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  return (
    <span className="relative grid size-5 place-items-center">
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [0.9, 1, 2.2], opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.6, delay: delay + 0.12, times: [0, 0.05, 1], ease: "easeOut" }}
        className="absolute inset-0 rounded-full ring-2 ring-emerald-500"
      />
      <motion.span
        initial={{ scale: 2.4, rotate: -16, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 760, damping: 22, delay, opacity: { duration: 0.08, delay } }}
        className="relative grid size-5 place-items-center rounded-full bg-emerald-600 text-white"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-3">
          <motion.path d="M2.8 6.3l2.2 2.2 4.2-4.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.24, delay: delay + 0.16, ease: "easeOut" }} />
        </svg>
      </motion.span>
    </span>
  );
}

/** Working: a short pen stroke circling a faint ring. */
function WorkingMark({ still }: { still?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" strokeWidth={2} strokeLinecap="round" className={cn("size-5", !still && "animate-spin [animation-duration:900ms]")}>
      <circle cx="10" cy="10" r="7.5" className="stroke-neutral-950/10 dark:stroke-neutral-50/10" />
      <circle cx="10" cy="10" r="7.5" strokeDasharray="12 48" className="stroke-neutral-600 dark:stroke-neutral-400" />
    </svg>
  );
}

function icon(kind: Kind, still = false, delay = 0): ReactNode {
  if (kind === "success") return <StampMark still={still} delay={delay} />;
  if (kind === "error") return <DeclineMark still={still} />;
  if (kind === "loading") return <WorkingMark still={still} />;
  return null;
}

/* --------------------------------- shredder -------------------------------- */

const STRIPS = 10;
const GRIP = 0.16; // the shredder catches the sheet
const STAGGER = 0.035;
const PULL = 0.5;
const SHRED_TIME = (GRIP + (STRIPS - 1) * STAGGER + PULL) * 1000 + 40;

/**
 * A declined ticket going through a shredder: cut into strips, each pulled
 * back down into the slot a beat apart, swaying a little as it goes.
 */
function Shred({ height, bottom, children }: { height: number; bottom: boolean; children: ReactNode }) {
  return (
    <motion.div
      aria-hidden
      inert
      animate={{ x: [0, -2, 2, -1, 0] }}
      transition={{ duration: GRIP }}
      style={{ height }}
      className={cn("pointer-events-none absolute inset-x-0", bottom ? "bottom-0" : "top-0")}
    >
      {Array.from({ length: STRIPS }, (_, i) => (
        <Strip key={i} i={i} height={height} bottom={bottom}>
          {children}
        </Strip>
      ))}
    </motion.div>
  );
}

function Strip({ i, height, bottom, children }: { i: number; height: number; bottom: boolean; children: ReactNode }) {
  const pulled = useMotionValue(0);
  const left = (i / STRIPS) * 100;
  const right = 100 - ((i + 1) / STRIPS) * 100;
  const y = useTransform(pulled, (v) => (bottom ? v : -v));
  const clipPath = useTransform(pulled, (v) => (bottom ? `inset(0 ${right}% ${v}px ${left}%)` : `inset(${v}px ${right}% 0 ${left}%)`));
  const sway = (i % 2 ? 1 : -1) * (0.8 + ((i * 5) % 3) * 0.5);
  const rotate = useTransform(pulled, [0, height], [0, sway]);

  useEffect(() => {
    // A scrambled order, so the strips don't go in like a wipe
    const run = animate(pulled, height + 2, { duration: PULL, delay: GRIP + ((i * 7) % STRIPS) * STAGGER, ease: [0.5, 0, 0.75, 0] });
    return () => run.stop();
  }, [pulled, height, i]);

  return (
    <motion.div style={{ y, rotate, clipPath, transformOrigin: `${left + 5}% ${bottom ? "100%" : "0%"}` }} className="absolute inset-0">
      {children}
      {i > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: GRIP }}
          style={{ left: `${left}%` }}
          className="absolute inset-y-0 w-px bg-neutral-950/15 dark:bg-neutral-50/15"
        />
      )}
    </motion.div>
  );
}

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
  /** How the ticket leaves: declined is shredded, approved is filed back into the slot, the rest flap over. */
  const [leaving, setLeaving] = useState<"shred" | "file" | "flap" | null>(null);
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

  // Flapping over: tips back on the edge in the slot, darkening as it goes edge-on
  const tilt = useMotionValue(0);
  const shade = useTransform(tilt, (v) => 1 - (Math.abs(v) / 90) * 0.45);

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

  // Roll out of the slot in one long, even motion, the way a typewriter feeds a sheet
  useLayoutEffect(() => {
    if (reduced) return;
    const run = animate(feed, 0, { duration: 0.7, ease: [0.25, 0.8, 0.3, 1] });
    return () => run.stop();
  }, [feed, reduced]);

  // Reprinted (promise settled, same id): a full life again
  useEffect(() => {
    life.set(1);
  }, [ticket.version, ticket.kind, life]);

  const live = depth === 0 || expanded;
  const tucked = !expanded && depth > 0;
  /** Leaves the way its kind does. Tucked in the pile, or with reduced motion, it just fades. */
  const leave = () => {
    if (torn || leaving) return;
    if (reduced || tucked || own === 0) toast.dismiss(ticket.id);
    else setLeaving(ticket.kind === "error" ? "shred" : ticket.kind === "success" ? "file" : "flap");
  };
  const latest = useRef(leave);
  useLayoutEffect(() => {
    latest.current = leave;
  });

  useEffect(() => {
    if (!timed || paused || torn || leaving) return;
    const run = animate(life, 0, {
      duration: (life.get() * duration) / 1000,
      ease: "linear",
      onComplete: () => latest.current(),
    });
    return () => run.stop();
  }, [timed, paused, torn, leaving, duration, life, ticket.id, ticket.version]);

  useEffect(() => {
    if (!leaving) return;
    if (leaving === "shred") {
      const t = setTimeout(() => toast.dismiss(ticket.id), SHRED_TIME);
      return () => clearTimeout(t);
    }
    // Filed: rolled back into the slot, quicker than it came out. Flap: tipped over backwards.
    const run =
      leaving === "file"
        ? animate(feed, 1, { duration: 0.5, ease: [0.5, 0, 0.75, 0] })
        : animate(tilt, side * 90, { duration: 0.42, ease: [0.55, 0, 0.8, 0.3] });
    run.then(() => toast.dismiss(ticket.id));
    return () => run.stop();
  }, [leaving, feed, tilt, side, ticket.id]);

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

  /** Closed by hand (button or Escape) leaves the same way as running out of time. */
  const close = leave;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = (info.offset.x + info.velocity.x * 0.15 >= 0 ? 1 : -1) as 1 | -1;
    if (Math.abs(info.offset.x) > TEAR_DISTANCE || Math.abs(info.velocity.x) > TEAR_VELOCITY) tear(dir, info.velocity.x);
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 30 });
  };

  /** The ticket's printed face. `still` is a copy for the shredder: no typing, no motion. */
  const face = (still: boolean) => (
    <>
      <div className={cn("flex items-start gap-3 py-3.5 pr-10 pl-4", bottom ? "pb-5" : "pt-5")}>
        {still ? (
          icon(ticket.kind, true) && <span className="mt-px flex shrink-0">{icon(ticket.kind, true)}</span>
        ) : (
          <AnimatePresence mode="popLayout">
            {icon(ticket.kind) && (
              <motion.span
                key={ticket.kind}
                initial={ticket.kind === "success" || ticket.kind === "error" ? false : { scale: 0.3, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 22 }}
                className="mt-px flex shrink-0"
              >
                {icon(ticket.kind, false, ticket.version === 0 ? 0.5 : 0.08)}
              </motion.span>
            )}
          </AnimatePresence>
        )}
        <Typewriter
          key={still ? "still" : ticket.version}
          title={ticket.title}
          description={ticket.description}
          delay={ticket.version === 0 ? 260 : 90}
          reduced={still || !!reduced}
          hold={ticket.kind === "loading"}
        />
        {ticket.action && (
          <button
            type="button"
            tabIndex={still ? -1 : undefined}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClick={() => {
              ticket.action?.onClick();
              tear(1);
            }}
            className="-my-0.5 h-7 shrink-0 cursor-pointer rounded-lg bg-neutral-950 dark:bg-neutral-50 px-2.5 text-[13px] font-medium text-neutral-50 dark:text-neutral-950 transition-colors outline-none hover:bg-neutral-800 dark:hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60"
          >
            {ticket.action.label}
          </button>
        )}
      </div>

      {!still && (
        <button
          type="button"
          aria-label="Dismiss"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={close}
          className="absolute top-2.5 right-2.5 grid size-6 cursor-pointer place-items-center rounded-md text-neutral-500 opacity-0 transition-[opacity,color,background-color] outline-none group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-neutral-950/[0.06] dark:hover:bg-neutral-50/[0.06] hover:text-neutral-950 dark:hover:text-neutral-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60 max-sm:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      )}

      {/* The perforation at the slot edge, burning down as time runs out */}
      <TearLine life={life} timed={timed} working={ticket.kind === "loading" && !still && !reduced} bottom={bottom} />
    </>
  );

  const shell =
    "rounded-2xl bg-white shadow-lg ring-1 shadow-black/[0.08] ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] dark:bg-neutral-900 dark:shadow-black/40";

  return (
    <motion.li
      layout={false}
      initial={false}
      animate={{
        y: -side * offset,
        scale: tucked ? 1 - depth * 0.05 : 1,
        opacity: 1,
      }}
      exit={torn || leaving ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, scale: 0.94, filter: "blur(2px)", transition: { duration: 0.2 } }}
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
            close();
          }
        }}
        initial={false}
        animate={{ height: own === 0 ? "auto" : tucked ? frontHeight : own }}
        transition={reduced ? { duration: 0 } : springy}
        style={{ x, y, rotate, rotateX: tilt, transformPerspective: 700, opacity: shade, clipPath, transformOrigin: bottom ? "50% 100%" : "50% 0%" }}
        className={cn(
          "group relative touch-pan-y overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-600/60 dark:focus-visible:ring-blue-500/60",
          shell,
          live ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
          leaving === "shred" && "invisible",
        )}
      >
        <div ref={content} className={cn("transition-opacity duration-200", tucked && "opacity-0")}>
          {face(false)}
        </div>
      </motion.div>

      {leaving === "shred" && (
        <Shred height={own} bottom={bottom}>
          <div className={cn("relative h-full overflow-hidden", shell)}>{face(true)}</div>
        </Shred>
      )}
    </motion.li>
  );
}

/* -------------------------------- typewriter -------------------------------- */

/** Milliseconds per character, so a short line types slowly and a long one still finishes in about half a second. */
const pace = (length: number) => Math.min(34, Math.max(12, 560 / Math.max(length, 1)));

/**
 * The ticket's words, typed in behind a caret. The title types, the caret
 * returns to the start of the next line, the description types, and the caret
 * goes home and fades (or, while `hold`, waits at the end blinking). Both lines are laid out in full from the first frame
 * (an invisible copy under the typed one), so typing never moves anything.
 * Text that isn't a plain string appears whole.
 */
function Typewriter({
  title,
  description,
  delay,
  reduced,
  hold = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  delay: number;
  reduced: boolean;
  /** Still working: once typed, the caret waits at the end of the line, blinking. */
  hold?: boolean;
}) {
  const head = typeof title === "string" ? title : "";
  const body = typeof description === "string" ? description : "";
  const a = head.length;
  const b = body.length;
  // Steps: a characters of title, then (with a description) one carriage return, then b characters
  const steps = b > 0 ? a + 1 + b : a;
  const [step, setStep] = useState(reduced ? steps : 0);
  const [home, setHome] = useState(reduced || steps === 0);

  const mark = useRef<HTMLSpanElement>(null);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const caret = useMotionValue(home ? 0 : 1);
  const lastTop = useRef<number | null>(null);

  useEffect(() => {
    if (home) return;
    if (step >= steps) {
      if (hold) return;
      const t = setTimeout(() => setHome(true), 420);
      return () => clearTimeout(t);
    }
    const wait = step === 0 ? delay : step === a && b > 0 ? 240 : step === a + 1 && b > 0 ? 300 : pace(step < a ? a : b);
    const t = setTimeout(() => setStep(step + 1), wait);
    return () => clearTimeout(t);
  }, [step, steps, home, delay, a, b, hold]);

  // Waiting at the end of the line
  useEffect(() => {
    if (!hold || home || step < steps) return;
    const blink = animate(caret, [1, 1, 0, 0], { duration: 1, times: [0, 0.5, 0.55, 1], repeat: Infinity });
    return () => blink.stop();
  }, [hold, home, step, steps, caret]);

  // Follow the insertion point; a new line is a carriage return the caret slides through
  useLayoutEffect(() => {
    const node = mark.current;
    if (!node || home) return;
    const left = node.offsetLeft;
    const top = node.offsetTop;
    if (lastTop.current !== null && top !== lastTop.current) {
      animate(cx, left, { duration: 0.3, ease: [0.3, 0.7, 0.2, 1] });
      animate(cy, top, { duration: 0.3, ease: [0.3, 0.7, 0.2, 1] });
    } else {
      cx.set(left);
      cy.set(top);
    }
    lastTop.current = top;
  }, [step, home, cx, cy]);

  // Done: back to the start of the line, and gone
  useEffect(() => {
    if (!home || reduced) return;
    const back = animate(cx, 0, { duration: 0.34, ease: [0.3, 0.7, 0.2, 1] });
    const fade = animate(caret, 0, { duration: 0.2, delay: 0.26 });
    return () => {
      back.stop();
      fade.stop();
    };
  }, [home, reduced, cx, caret]);

  const titleTyped = Math.min(step, a);
  const bodyTyped = Math.max(0, step - a - 1);
  const inBody = b > 0 && step > a;
  const marker = <span ref={mark} className="inline-block h-5 w-0 align-top" />;

  const line = (full: string, typed: number, markHere: boolean, className: string) => (
    <p aria-hidden className={cn("grid", className)}>
      <span className="invisible col-start-1 row-start-1">{full}</span>
      <span className="col-start-1 row-start-1">
        {full.slice(0, typed)}
        {markHere && marker}
      </span>
    </p>
  );

  return (
    <div className="relative min-w-0 flex-1">
      {head ? (
        <>
          <span className="sr-only">{head}</span>
          {line(head, titleTyped, !inBody, "text-sm leading-5 font-medium text-neutral-950 dark:text-neutral-50")}
        </>
      ) : (
        <p className="text-sm leading-5 font-medium text-neutral-950 dark:text-neutral-50">{title}</p>
      )}
      {description &&
        (body ? (
          <>
            <span className="sr-only">{body}</span>
            {line(body, bodyTyped, inBody, "mt-0.5 text-[13px] leading-5 text-neutral-600 dark:text-neutral-400")}
          </>
        ) : (
          <p className="mt-0.5 text-[13px] leading-5 text-neutral-600 dark:text-neutral-400">{description}</p>
        ))}
      {steps > 0 && !reduced && (
        <motion.span aria-hidden style={{ x: cx, y: cy, opacity: caret }} className="pointer-events-none absolute top-0.5 left-0 h-4 w-0.5 rounded-full bg-blue-600 dark:bg-blue-500" />
      )}
    </div>
  );
}

function TearLine({ life, timed, working, bottom }: { life: MotionValue<number>; timed: boolean; working: boolean; bottom: boolean }) {
  const dashes = "bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_7px)]";
  return (
    <span aria-hidden className={cn("absolute inset-x-4 h-px", bottom ? "bottom-2" : "top-2")}>
      <span className={cn("absolute inset-0 text-neutral-950/[0.12] dark:text-neutral-50/[0.12]", dashes)} />
      {timed && <motion.span style={{ scaleX: life }} className={cn("absolute inset-0 origin-left text-neutral-950/40 dark:text-neutral-50/40", dashes)} />}
      {/* Still working: a print head shuttling along the line */}
      {working && (
        <motion.span
          animate={{ left: ["0%", "78%"] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className={cn("absolute inset-y-0 w-[22%] text-neutral-950/50 dark:text-neutral-50/50", dashes)}
        />
      )}
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
      className="h-9 cursor-pointer rounded-[10px] bg-neutral-50 px-3.5 text-[13px] font-medium text-neutral-900 dark:text-neutral-100 shadow-sm ring-1 shadow-black/[0.06] ring-neutral-950/10 dark:ring-neutral-50/10 transition-colors outline-none select-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:focus-visible:ring-blue-500/50 active:bg-neutral-200 dark:active:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
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
