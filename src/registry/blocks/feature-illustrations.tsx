"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/*
 * Illustrated Features: three cards, each with one small drawn illustration
 * above its copy. Every illustration is plain divs and does one thing when
 * the card is hovered (or tapped): a folder opens and fans its files out,
 * your own cursor joins two teammates on a shared frame, and a stack of
 * versions spreads apart so you can read their history.
 */

const spring = { type: "spring", stiffness: 260, damping: 24 } as const;

/* ---------- 1. Folder ---------- */

const FILES = [
  { name: "brief.pdf", tone: "bg-rose-400", closed: { x: -8, y: 0, rotate: -4 }, open: { x: -62, y: -58, rotate: -13 } },
  { name: "cover.png", tone: "bg-sky-400", closed: { x: 0, y: -6, rotate: 0 }, open: { x: 0, y: -70, rotate: 0 } },
  { name: "copy.doc", tone: "bg-emerald-400", closed: { x: 8, y: 0, rotate: 4 }, open: { x: 62, y: -58, rotate: 13 } },
];

function File({ name, tone }: { name: string; tone: string }) {
  return (
    <div className="h-[104px] w-[128px] rounded-[10px] bg-white p-2.5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_6px_16px_-6px_rgb(0_0_0/0.18)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]">
      <div className={cn("h-9 rounded-[5px] opacity-80", tone)} />
      <div className="mt-2 h-1.5 w-4/5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <p className="mt-2 text-[10px] font-medium text-neutral-500">{name}</p>
    </div>
  );
}

function Folder({ open }: { open: boolean }) {
  return (
    <div className="relative h-[150px] w-[220px] [perspective:700px]">
      {/* Back, with its tab */}
      <div className="absolute top-0 left-0 h-6 w-20 rounded-t-[10px] bg-orange-300 dark:bg-orange-400/70" />
      <div className="absolute inset-x-0 top-4 bottom-0 rounded-[14px] rounded-tl-none bg-orange-300 dark:bg-orange-400/70" />

      {FILES.map((f) => (
        <motion.div key={f.name} className="absolute bottom-5 left-1/2 -ml-[64px]" initial={false} animate={open ? f.open : f.closed} transition={spring}>
          <File name={f.name} tone={f.tone} />
        </motion.div>
      ))}

      {/* Front flap, tipping toward you as it opens */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[104px] origin-bottom rounded-[14px] bg-gradient-to-b from-orange-400 to-orange-500 shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_-6px_16px_-8px_rgb(0_0_0/0.25)]"
        initial={false}
        animate={{ rotateX: open ? -32 : 0 }}
        transition={spring}
      >
        <span className="absolute bottom-3 left-4 text-[11px] font-semibold text-white/90">Launch</span>
        <span className="absolute right-4 bottom-3 text-[11px] text-white/70 tabular-nums">3 files</span>
      </motion.div>
    </div>
  );
}

/* ---------- 2. Cursors ---------- */

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]", className)} aria-hidden>
      <path d="M2 1.5 14 7l-5.2 1.6L6.6 14z" fill="currentColor" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Cursor({ name, color, text, path, duration, run }: { name: string; color: string; text: string; path: { x: number[]; y: number[] }; duration: number; run: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 left-1/2 z-10"
      initial={{ x: path.x[0], y: path.y[0] }}
      animate={run ? { x: path.x, y: path.y } : undefined}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <Arrow className={text} />
      <span className={cn("ml-3 -mt-0.5 block w-max rounded-full px-2 py-0.5 text-[10px] font-medium text-white", color)}>{name}</span>
    </motion.div>
  );
}

function Frame({ active, run }: { active: boolean; run: boolean }) {
  return (
    <div className="relative">
      <div className="h-[148px] w-[224px] rounded-[12px] bg-white p-3 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_10px_24px_-10px_rgb(0_0_0/0.2)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <div className="h-[72px] rounded-[7px] bg-[linear-gradient(135deg,#fdba74,#fb7185_55%,#a78bfa)]" />
        {/* Maya has the headline selected */}
        <div className="relative mt-3 w-fit">
          <div className="h-2 w-28 rounded-full bg-neutral-800 dark:bg-neutral-200" />
          <div className="mt-1.5 h-1.5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <span className="absolute -inset-1.5 rounded-[4px] ring-1 ring-violet-500" />
        </div>
      </div>

      {/* A comment, answered once you're here */}
      <div className="absolute -top-4 -right-6 w-[132px]">
        <div className="rounded-[10px] rounded-bl-none bg-white px-2.5 py-2 text-[10px] leading-snug text-neutral-700 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_20px_-8px_rgb(0_0_0/0.25)] dark:bg-neutral-900 dark:text-neutral-300 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
          <span className="font-semibold text-neutral-950 dark:text-white">Theo</span> Warmer sky?
        </div>
        <motion.div
          initial={false}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -4, scale: 0.96 }}
          transition={spring}
          className="mt-1.5 ml-4 rounded-[10px] rounded-bl-none bg-neutral-950 px-2.5 py-2 text-[10px] leading-snug text-white dark:bg-white dark:text-neutral-950"
        >
          <span className="font-semibold">You</span> On it
        </motion.div>
      </div>

      <Cursor name="Maya" color="bg-violet-500" text="text-violet-500" path={{ x: [-40, -10, -60, -40], y: [30, 20, 40, 30] }} duration={6} run={run} />
      <Cursor name="Theo" color="bg-sky-500" text="text-sky-500" path={{ x: [40, 10, 70, 40], y: [-20, 0, 8, -20] }} duration={7.5} run={run} />
    </div>
  );
}

/* ---------- 3. Versions ---------- */

const VERSIONS = [
  { label: "v1", when: "Mon", note: "First pass" },
  { label: "v2", when: "Tue", note: "New cover" },
  { label: "v3", when: "Yesterday", note: "Copy edits" },
  { label: "v4", when: "Now", note: "Current" },
];

function Versions({ open }: { open: boolean }) {
  const gap = open ? 34 : 12;
  return (
    <div className="relative h-[180px] w-[240px]">
      {VERSIONS.map((v, i) => {
        const top = i === VERSIONS.length - 1;
        const y = 110 - i * gap;
        return (
          <div key={v.label}>
            {/* The sheet, laid flat in isometric */}
            <motion.div className="absolute left-6" initial={false} animate={{ y }} transition={{ ...spring, delay: open ? i * 0.03 : (3 - i) * 0.03 }} style={{ zIndex: i }}>
              <div
                className={cn(
                  "size-[92px] rounded-[12px] p-2.5 [transform:rotateX(58deg)_rotateZ(-45deg)]",
                  top
                    ? "bg-white shadow-[0_0_0_1px_rgb(249_115_22/0.6),0_12px_20px_-8px_rgb(249_115_22/0.5)] dark:bg-neutral-800"
                    : "bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_10px_16px_-10px_rgb(0_0_0/0.25)] dark:bg-neutral-800 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
                )}
              >
                <div className={cn("h-7 rounded-[5px]", top ? "bg-orange-400" : "bg-neutral-200 dark:bg-neutral-700")} />
                <div className="mt-2 h-1.5 w-4/5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </motion.div>

            {/* Its label, which only fits once the stack has spread */}
            <motion.div
              className="absolute left-[150px] flex items-center gap-2 text-[11px] whitespace-nowrap"
              initial={false}
              animate={{ y: y + 34, opacity: open || top ? 1 : 0 }}
              transition={spring}
            >
              <span className="h-px w-4 bg-neutral-300 dark:bg-neutral-600" />
              <span className={cn("font-semibold tabular-nums", top ? "text-orange-600 dark:text-orange-400" : "text-neutral-900 dark:text-neutral-100")}>{v.label}</span>
              <span className="text-neutral-500">{open ? v.when : v.note}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Card ---------- */

function Card({ title, body, children }: { title: string; body: string; children: (open: boolean) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onPointerUp={(e) => e.pointerType !== "mouse" && setOpen((o) => !o)}
      className="group h-full overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.07)] dark:bg-neutral-950 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
    >
      <div className="relative grid h-72 place-items-center overflow-hidden border-b border-neutral-950/[0.06] bg-neutral-50 dark:border-neutral-50/[0.06] dark:bg-neutral-900/60">
        {/* Dot grid, fading toward the edges */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(rgb(0_0_0/0.12)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] dark:bg-[radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)]"
        />
        <div aria-hidden className="relative">
          {children(open)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[15px] font-medium text-neutral-950 dark:text-neutral-50">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-6 text-neutral-500">{body}</p>
      </div>
    </div>
  );
}

/** The cursors card also puts your own cursor on the frame while the pointer is over it. */
function CursorsCard({ run }: { run: boolean }) {
  const area = useRef<HTMLDivElement>(null);
  const [here, setHere] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 600, damping: 40 });
  const y = useSpring(my, { stiffness: 600, damping: 40 });

  return (
    <div
      ref={area}
      className="relative h-full [&_*]:cursor-none"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !area.current) return;
        const r = area.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHere(true)}
      onPointerLeave={() => setHere(false)}
    >
      <Card title="Review in the file" body="Comments sit on the thing they're about, and you can see who's looking at what, live.">
        {(open) => <Frame active={open} run={run} />}
      </Card>
      <motion.div className="pointer-events-none absolute top-0 left-0 z-20" style={{ x, y }} initial={false} animate={{ opacity: here ? 1 : 0 }}>
        <Arrow className="text-neutral-950 dark:text-white" />
        <span className="ml-3 -mt-0.5 block w-max rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-white dark:text-neutral-950">You</span>
      </motion.div>
    </div>
  );
}

/**
 * A feature section for a shared workspace, told in three drawn
 * illustrations. Hover a card (or tap it) and its illustration acts: the
 * folder opens and fans its files out, your cursor joins two teammates on a
 * frame and answers a comment, and the stack of versions spreads so each one
 * shows when it was made.
 */
export function FeatureIllustrations({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-80px" });

  return (
    <MotionConfig reducedMotion="user">
      <section ref={ref} data-slot="feature-illustrations" className={cn("bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-md text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-neutral-950 sm:text-[42px] dark:text-neutral-50">Everything the launch needs, in one room.</h2>
            <p className="max-w-sm text-[15px] leading-6 text-neutral-500">Files, feedback and every version of both, shared with the people making it. Hover a card to see it work.</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Card title="One folder per launch" body="Briefs, assets and copy live together, so nobody digs through a thread to find the latest cover.">
              {(open) => <Folder open={open} />}
            </Card>
            <CursorsCard run={inView && !reduce} />
            <Card title="Every version, kept" body="Each save is a version you can open, compare or bring back. Nothing gets overwritten.">
              {(open) => <Versions open={open} />}
            </Card>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

export default function Demo() {
  return <FeatureIllustrations />;
}
