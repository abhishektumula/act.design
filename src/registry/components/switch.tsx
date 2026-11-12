"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { BellRing, Moon, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export const switchVariants = cva(
  "group relative inline-flex shrink-0 cursor-pointer touch-none items-center rounded-full bg-base-50/10 p-[3px] shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)] outline-none select-none hover:bg-base-50/[0.14] focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-6 w-10",
        md: "h-8 w-[54px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const sizes = { sm: { thumb: 18, w: 40, grow: 5 }, md: { thumb: 26, w: 54, grow: 7 } };
const spring = { type: "spring", stiffness: 700, damping: 36, mass: 0.7 } as const;

/**
 * A toggle with travel. Press and the thumb stretches toward where it is going;
 * release and it lands. You can also drag the thumb across, like the real thing.
 */
export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  size = "md",
  className,
  ...aria
}: VariantProps<typeof switchVariants> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}) {
  const [inner, setInner] = useState(defaultChecked);
  const on = controlled ?? inner;
  const [pressed, setPressed] = useState(false);
  /** Where a drag would leave the switch, while one is happening. */
  const [dragTo, setDragTo] = useState<boolean | null>(null);
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const s = sizes[size ?? "md"];
  const travel = s.w - s.thumb - 6;
  const shown = dragTo ?? on;

  const set = (next: boolean) => {
    if (next === on) return;
    navigator.vibrate?.(6);
    if (controlled === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, moved: false };
    setPressed(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    if (Math.abs(dx) > 5) {
      start.current.moved = true;
      setDragTo(dx > 0);
    }
  };
  const onPointerUp = () => {
    if (start.current?.moved) {
      skipClick.current = true;
      if (dragTo !== null) set(dragTo);
    }
    start.current = null;
    setPressed(false);
    setDragTo(null);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      data-state={on ? "on" : "off"}
      data-slot="switch"
      onClick={() => {
        if (skipClick.current) skipClick.current = false;
        else set(!on);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(switchVariants({ size }), className)}
      {...aria}
    >
      {/* Fill, timed to land with the thumb */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-signal shadow-[inset_0_1px_2px_rgb(0_0_0/0.25),0_0_14px_-3px_var(--signal)]"
      />
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: shown ? travel : 0, scaleX: pressed ? (s.thumb + s.grow) / s.thumb : 1 }}
        transition={spring}
        style={{ width: s.thumb, height: s.thumb, originX: shown ? 1 : 0 }}
        className="relative rounded-full bg-white shadow-[inset_0_-1px_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.12),0_2px_6px_-1px_rgb(0_0_0/0.22)] dark:bg-base-100"
      />
    </button>
  );
}

function Row({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children: (ids: { label: string; desc: string }) => ReactNode }) {
  const id = useId();
  const ids = { label: `${id}-l`, desc: `${id}-d` };
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-50/5 text-base-300 ring-1 ring-base-50/5 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p id={ids.label} className="text-sm font-medium text-base-100">
          {title}
        </p>
        <p id={ids.desc} className="text-[13px] text-base-500">
          {body}
        </p>
      </div>
      {children(ids)}
    </div>
  );
}

export default function Demo() {
  const [live, setLive] = useState(true);
  return (
    <div className="w-full max-w-sm divide-y divide-base-50/5 overflow-hidden rounded-3xl bg-base-950 shadow-[0_1px_0_white_inset,0_20px_40px_-24px_var(--color-shade)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]">
      <Row icon={<Radio />} title="Go live" body={live ? "Broadcasting to 1,204 people" : "Only you can see this"}>
        {(ids) => <Switch checked={live} onCheckedChange={setLive} aria-labelledby={ids.label} aria-describedby={ids.desc} />}
      </Row>
      <Row icon={<BellRing />} title="Mentions" body="Ping me when someone @'s me">
        {(ids) => <Switch defaultChecked aria-labelledby={ids.label} aria-describedby={ids.desc} />}
      </Row>
      <Row icon={<Moon />} title="Quiet hours" body="Mute everything after 10 pm">
        {(ids) => <Switch aria-labelledby={ids.label} aria-describedby={ids.desc} />}
      </Row>
    </div>
  );
}
