"use client";

import { useState, type ReactNode } from "react";
import { motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

const spring: Transition = { type: "spring", stiffness: 320, damping: 26, mass: 0.8 };

/** Where each sheet goes when the folder opens: rise, sideways nudge, tilt. */
const fan = [
  { y: "-34%", x: "-9%", rotate: -7 },
  { y: "-46%", x: "0%", rotate: 1.5 },
  { y: "-38%", x: "9%", rotate: 8 },
];

const bloom: Transition = { type: "spring", stiffness: 340, damping: 17, mass: 0.7 };

/**
 * Where each file pill lands when the folder opens: petals on an arc over the folder,
 * opening from straight up out to either side. Positions are % of the folder's box.
 */
function petal(i: number, n: number) {
  const spread = Math.min(150, 34 * (n - 1));
  const a = n === 1 ? 0 : ((-spread / 2 + (spread * i) / (n - 1)) * Math.PI) / 180;
  return { left: `${50 + 47 * Math.sin(a)}%`, top: `${26 - 58 * Math.cos(a)}%`, rotate: (a * 180) / Math.PI / 4 };
}

/** The file name with its extension set off as a small tag. */
function Pill({ name }: { name: string }) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1) : "";
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-1 pl-2.5 text-[11px] leading-none font-medium whitespace-nowrap text-neutral-800 shadow-[0_1px_2px_rgb(0_0_0/0.12),0_8px_18px_-8px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-white/10">
      <span className="size-1.5 shrink-0 rounded-full bg-(--folder)" />
      {base}
      {ext && <span className="rounded-full bg-neutral-950/[0.06] px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-neutral-500 uppercase dark:bg-white/10 dark:text-neutral-400">{ext}</span>}
    </span>
  );
}

/** A sheet of paper with a few lines on it. Pass your own content to replace the lines. */
function Sheet({ children }: { children?: ReactNode }) {
  return (
    <div className="size-full overflow-hidden rounded-[10px] bg-neutral-50 p-3 shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_14px_-6px_rgb(0_0_0/0.25)] ring-1 ring-black/5">
      {children ?? (
        <div className="space-y-1.5">
          <div className="h-1.5 w-1/2 rounded-full bg-neutral-800/70" />
          <div className="h-1 w-full rounded-full bg-neutral-800/15" />
          <div className="h-1 w-5/6 rounded-full bg-neutral-800/15" />
          <div className="h-1 w-2/3 rounded-full bg-neutral-800/15" />
        </div>
      )}
    </div>
  );
}

/**
 * A folder you can peek into. Hover or focus it and the front flap tips open while the
 * papers inside slide up and fan out, and the files inside burst out of it as little pills
 * that bloom over the top like petals. Tap toggles it on touch screens.
 */
export function FolderCard({
  title,
  meta,
  sheets = [],
  files = [],
  color = "var(--color-blue-500)",
  href,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  /** Up to three sheets. Leave empty for blank pages with ruled lines. */
  sheets?: ReactNode[];
  /** File names that bloom out of the folder as pills when it opens. Five or six look best. */
  files?: string[];
  /** Any CSS colour for the folder. Defaults to Tailwind blue-500. */
  color?: string;
  href?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const Root = href ? motion.a : motion.div;
  const pages = [0, 1, 2].map((i) => sheets[i]);

  return (
    <Root
      href={href}
      data-slot="folder-card"
      tabIndex={href ? undefined : 0}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onClick={() => !href && setOpen((o) => !o)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      initial={false}
      animate={open ? "open" : "closed"}
      style={{ "--folder": color } as React.CSSProperties}
      className={cn(
        "relative block aspect-[5/4] w-full max-w-72 cursor-pointer rounded-[18px] outline-none [perspective:900px] focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:focus-visible:ring-blue-500/50 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-950",
        className,
      )}
    >
      {/* Back of the folder, with its tab */}
      <div className="absolute inset-x-0 top-[9%] bottom-0 rounded-[18px] rounded-tl-none bg-[color-mix(in_oklab,var(--folder)_72%,black)]">
        <div className="absolute -top-[13%] left-0 h-[14%] w-[42%] rounded-t-[12px] bg-[color-mix(in_oklab,var(--folder)_72%,black)]" />
      </div>

      {/* Papers */}
      {pages.map((content, i) => (
        <motion.div
          key={i}
          variants={{
            closed: { y: "0%", x: "0%", rotate: 0 },
            open: { ...fan[i], transition: { ...spring, delay: i * 0.035 } },
          }}
          transition={spring}
          className="absolute inset-x-[9%] top-[16%] h-[62%]"
          style={{ zIndex: i === 1 ? 2 : 1 }}
        >
          <Sheet>{content}</Sheet>
        </motion.div>
      ))}

      {/* Files: they leave from the folder's mouth and open out over it, centre first */}
      {files.map((name, i) => {
        const n = files.length;
        const order = Math.abs(i - (n - 1) / 2);
        return (
          <motion.div
            key={name + i}
            aria-hidden
            variants={{
              closed: { left: "50%", top: "34%", scale: 0.3, rotate: 0, opacity: 0, transition: { ...spring, delay: ((n - 1) / 2 - order) * 0.02, opacity: { duration: 0.12, delay: 0.08 } } },
              open: { ...petal(i, n), scale: 1, opacity: 1, transition: { ...bloom, delay: 0.06 + order * 0.045, opacity: { duration: 0.1, delay: 0.06 + order * 0.045 } } },
            }}
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <Pill name={name} />
          </motion.div>
        );
      })}

      {/* Front flap: tips forward on its bottom edge */}
      <motion.div
        variants={{ closed: { rotateX: 0 }, open: { rotateX: -24 } }}
        transition={spring}
        style={{ transformOrigin: "50% 100%" }}
        className="absolute inset-x-0 bottom-0 z-10 flex h-[68%] flex-col justify-end rounded-[18px] bg-linear-to-b from-[color-mix(in_oklab,var(--folder)_86%,white)] to-(--folder) p-4 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_-6px_16px_-10px_rgb(0_0_0/0.4)]"
      >
        <p className="text-[15px] leading-tight font-semibold tracking-[-0.01em]">{title}</p>
        {meta && <p className="mt-1 text-xs text-white/75">{meta}</p>}
      </motion.div>
    </Root>
  );
}

function Uptime() {
  const bars = [9, 9, 9, 8, 9, 9, 3, 9, 9, 9, 9, 7, 9, 9];
  return (
    <div>
      <div className="h-1.5 w-2/5 rounded-full bg-neutral-800/70" />
      <div className="mt-2.5 flex h-6 items-end gap-[2px]">
        {bars.map((h, i) => (
          <span key={i} style={{ height: `${h * 11}%` }} className={cn("flex-1 rounded-[1px]", h < 5 ? "bg-orange-600" : "bg-emerald-600")} />
        ))}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div className="flex w-full justify-center px-10 pt-28 pb-4">
      <FolderCard
        title="Incident reports"
        meta="12 postmortems · updated today"
        sheets={[undefined, <Uptime key="u" />]}
        files={["api-outage.md", "timeline.csv", "postmortem.pdf", "latency.png", "runbook.md"]}
        className="w-72"
      />
    </div>
  );
}
