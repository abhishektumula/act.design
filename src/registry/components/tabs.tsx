"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type Tab = { id: string; label: string; content: ReactNode };

type Slots = { list?: string; tab?: string; indicator?: string; panel?: string };

const styles = {
  underline: {
    list: "flex border-b border-base-50/5",
    tab: "px-3 pt-1.5 pb-3",
    hover: "inset-x-0 top-0 bottom-1.5 rounded-lg bg-base-50/5",
    indicator: "inset-x-2 -bottom-px h-0.5 rounded-full bg-base-50",
  },
  pill: {
    list: "flex w-fit gap-1 rounded-full bg-base-950 p-1 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/60",
    tab: "h-8 rounded-full px-4",
    hover: "inset-0 rounded-full bg-base-50/5",
    indicator:
      "inset-0 rounded-full bg-linear-to-b from-base-700 to-base-800 shadow-md shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15",
  },
  minimal: {
    list: "flex gap-5",
    tab: "py-1",
    hover: "hidden",
    indicator: "hidden",
  },
};

export function Tabs({
  tabs,
  defaultTab,
  variant = "underline",
  className,
  classNames,
}: {
  tabs: Tab[];
  defaultTab?: string;
  variant?: keyof typeof styles;
  className?: string;
  classNames?: Slots;
}) {
  const id = useId();
  const s = styles[variant];
  const [active, setActive] = useState(defaultTab ?? tabs[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const index = tabs.findIndex((t) => t.id === active);

  return (
    <div data-slot="tabs" className={cn("w-full", className)}>
      <div role="tablist" className={cn("relative", s.list, classNames?.list)} onPointerLeave={() => setHovered(null)}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onPointerEnter={() => setHovered(tab.id)}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setActive(tab.id);
            }}
            className={cn(
              "relative text-sm outline-none transition-colors focus-visible:text-base-50",
              s.tab,
              tab.id === active ? "text-base-50" : "text-base-500 hover:text-base-300",
              classNames?.tab,
            )}
          >
            {hovered === tab.id && tab.id !== active && (
              <motion.span layoutId={`${id}-hover`} className={cn("absolute", s.hover)} transition={{ type: "spring", bounce: 0.1, duration: 0.35 }} />
            )}
            {tab.id === active && (
              <motion.span
                layoutId={`${id}-indicator`}
                className={cn("absolute", s.indicator, classNames?.indicator)}
                transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={cn("relative overflow-hidden pt-5", classNames?.panel)}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 24, filter: "blur(4px)" }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (d: number) => ({ opacity: 0, x: d * -24, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {tabs[index].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Panel({ title, body, stat }: { title: string; body: string; stat: string }) {
  return (
    <div className="rounded-2xl bg-base-900/60 p-5 ring-1 ring-base-50/5">
      <p className="text-3xl font-semibold tracking-tight text-base-50">{stat}</p>
      <p className="mt-3 text-sm font-medium text-base-200">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-base-500">{body}</p>
    </div>
  );
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview", content: <Panel stat="12.4k" title="Visitors this week" body="Up 18% from last week, mostly from your launch post." /> },
  { id: "analytics", label: "Analytics", content: <Panel stat="3m 12s" title="Average session" body="People are reading the docs end to end." /> },
  { id: "deploys", label: "Deploys", content: <Panel stat="48" title="Successful deploys" body="Zero failed builds in the last 30 days." /> },
];

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <Tabs tabs={tabs} />
    </div>
  );
}
