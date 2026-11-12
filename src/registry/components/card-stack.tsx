"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FLING_DISTANCE = 110;
const FLING_VELOCITY = 550;
const OFFSCREEN = 420;

type Command = { id: string; kind: "out" | "in"; dir: 1 | -1; n: number };

function Card({
  id,
  depth,
  command,
  onSend,
  children,
}: {
  id: string;
  depth: number;
  command: Command | null;
  onSend: (dir: 1 | -1) => void;
  children: ReactNode;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);
  const top = depth === 0;

  /** Out to the side on a short, timed tween (no spring to wait on), then home under the pile. */
  const fling = (dir: 1 | -1, velocity = 0) => {
    const distance = Math.abs(dir * OFFSCREEN - x.get());
    const speed = Math.max(Math.abs(velocity), 1800);
    animate(x, dir * OFFSCREEN, {
      duration: Math.min(0.26, Math.max(0.12, distance / speed)),
      ease: [0.25, 0.6, 0.45, 1],
    }).then(() => {
      onSend(dir);
      animate(x, 0, { type: "spring", stiffness: 380, damping: 34 });
    });
  };

  // Commands from the arrow buttons. Layout effect, so an incoming card is
  // already off to the side before the first paint at the top of the deck.
  useLayoutEffect(() => {
    if (!command || command.id !== id) return;
    if (command.kind === "out") fling(command.dir);
    else {
      x.set(command.dir * -OFFSCREEN);
      animate(x, 0, { type: "spring", stiffness: 380, damping: 34 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = (info.offset.x + info.velocity.x * 0.2 > 0 ? 1 : -1) as 1 | -1;
    if (Math.abs(info.offset.x) > FLING_DISTANCE || Math.abs(info.velocity.x) > FLING_VELOCITY) fling(dir, info.velocity.x);
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  return (
    <motion.div
      drag={top ? "x" : false}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ x, rotate, zIndex: 50 - depth }}
      initial={false}
      animate={{
        y: depth * -16,
        scale: 1 - depth * 0.06,
        opacity: depth > 3 ? 0 : 1,
        filter: `brightness(${1 - depth * 0.08})`,
      }}
      whileDrag={{ scale: 1.03, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn("absolute inset-0 origin-top touch-pan-y", top && "cursor-grab")}
    >
      {children}
    </motion.div>
  );
}

/**
 * A deck you deal with your hand. Fling the top card either way and it tucks
 * itself under the pile; the cards beneath rise to meet you. Arrow keys and
 * the buttons deal too.
 */
export function CardStack<T extends { id: string }>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  className?: string;
}) {
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  const [dealt, setDealt] = useState(0);
  const [command, setCommand] = useState<Command | null>(null);
  const flying = useRef(false);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  const send = () => {
    flying.current = false;
    setOrder((o) => [...o.slice(1), o[0]]);
    setDealt((d) => d + 1);
  };
  const next = () => {
    if (flying.current) return;
    flying.current = true;
    setCommand((c) => ({ id: order[0], kind: "out", dir: 1, n: (c?.n ?? 0) + 1 }));
  };
  const prev = () => {
    if (flying.current) return;
    const last = order[order.length - 1];
    setOrder([last, ...order.slice(0, -1)]);
    setDealt((d) => d - 1);
    setCommand((c) => ({ id: last, kind: "in", dir: 1, n: (c?.n ?? 0) + 1 }));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else return;
    e.preventDefault();
  };
  const position = (((dealt % items.length) + items.length) % items.length) + 1;

  return (
    <div
      data-slot="card-stack"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      className={cn("flex w-full max-w-[18rem] flex-col items-center rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-8 focus-visible:ring-offset-base-950", className)}
    >
      <div className="relative mt-12 aspect-[3/4] w-full">
        {order
          .map((id, depth) => ({ id, depth }))
          .reverse()
          .map(({ id, depth }) => (
            <Card
              key={id}
              id={id}
              depth={depth}
              command={command}
              onSend={send}
            >
              {renderItem(byId[id])}
            </Card>
          ))}
      </div>
      <div className="mt-8 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous card"
          className="grid size-9 place-items-center rounded-full text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-50 active:scale-95 [&_svg]:size-4"
        >
          <ArrowLeft />
        </button>
        <span className="font-mono text-xs text-base-500 tabular-nums" aria-live="polite">
          <span className="text-base-100">{String(position).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={next}
          aria-label="Next card"
          className="grid size-9 place-items-center rounded-full text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-50 active:scale-95 [&_svg]:size-4"
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

const swatches = [
  { id: "signal", name: "Signal", code: "OK 65 / 205 / 38", note: "For the one thing that matters on screen.", from: "color-mix(in oklab, var(--signal) 78%, white)", to: "color-mix(in oklab, var(--signal) 88%, black)", ink: "white" },
  { id: "cobalt", name: "Cobalt", code: "OK 52 / 190 / 264", note: "Deep enough to hold white type at any size.", from: "#4a6cff", to: "#1f36c9", ink: "white" },
  { id: "moss", name: "Moss", code: "OK 58 / 110 / 135", note: "A green that reads as calm, never as success.", from: "#7da15a", to: "#3f6a33", ink: "white" },
  { id: "bone", name: "Bone", code: "OK 94 / 015 / 85", note: "The paper everything else is printed on.", from: "#f6f1e6", to: "#e3dccb", ink: "#2a2620" },
  { id: "graphite", name: "Graphite", code: "OK 24 / 008 / 70", note: "Ink for type, wells and the dark of night mode.", from: "#3b3833", to: "#1b1a17", ink: "#f3efe6" },
];

export default function Demo() {
  return (
    <CardStack
      items={swatches}
      renderItem={(s) => (
        <div
          style={{ background: `linear-gradient(160deg, ${s.from}, ${s.to})`, color: s.ink }}
          className="flex size-full flex-col justify-between overflow-hidden rounded-[22px] p-6 shadow-[0_1px_0_rgb(255_255_255/0.35)_inset,0_24px_40px_-20px_rgb(0_0_0/0.45)] ring-1 ring-black/10 select-none"
        >
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase opacity-70">
            <span>Swatch</span>
            <span>{s.code}</span>
          </div>
          <div>
            <p className="font-serif text-6xl leading-none tracking-tight italic">{s.name}</p>
            <p className="mt-3 max-w-[14rem] text-sm leading-relaxed opacity-80">{s.note}</p>
          </div>
        </div>
      )}
    />
  );
}
