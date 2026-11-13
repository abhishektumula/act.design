"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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

const sizes = { sm: { thumb: 18, w: 40 }, md: { thumb: 26, w: 54 } };

/**
 * A toggle. The thumb and the fill move together on one eased transition, and
 * you can drag the thumb across as well as tap it.
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
  /** Where a drag would leave the switch, while one is happening. */
  const [dragTo, setDragTo] = useState<boolean | null>(null);
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const s = sizes[size ?? "md"];
  const travel = s.w - s.thumb - 6;
  const shown = dragTo ?? on;

  const set = (next: boolean) => {
    if (next === on) return;
    if (controlled === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    start.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    if (Math.abs(dx) > 6) {
      if (!start.current.moved) e.currentTarget.setPointerCapture(e.pointerId);
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
    setDragTo(null);
  };

  const ease = "duration-200 ease-[cubic-bezier(0.3,0.7,0.2,1)]";

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
      <span
        aria-hidden
        className={cn("absolute inset-0 rounded-full bg-signal transition-opacity", ease, shown ? "opacity-100" : "opacity-0")}
      />
      <span
        aria-hidden
        style={{ width: s.thumb, height: s.thumb, transform: `translateX(${shown ? travel : 0}px)` }}
        className={cn(
          "relative rounded-full bg-white shadow-[0_1px_1px_rgb(0_0_0/0.12),0_2px_5px_-1px_rgb(0_0_0/0.2)] transition-transform will-change-transform dark:bg-base-100",
          ease,
        )}
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
