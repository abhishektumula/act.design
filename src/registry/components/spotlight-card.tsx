"use client";

import { useRef, type ReactNode } from "react";
import { Gauge, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Spotlight colours. Each pair lights the border and the surface. */
export const spotlightTones = {
  neutral: {
    border: "bg-[radial-gradient(300px_circle_at_var(--x)_var(--y),var(--color-base-300),transparent_45%)]",
    surface: "bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),var(--color-base-700),transparent_40%)]",
  },
  blue: {
    border: "bg-[radial-gradient(300px_circle_at_var(--x)_var(--y),var(--color-blue-400),transparent_45%)]",
    surface: "bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),var(--color-blue-900),transparent_40%)]",
  },
  violet: {
    border: "bg-[radial-gradient(300px_circle_at_var(--x)_var(--y),var(--color-violet-400),transparent_45%)]",
    surface: "bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),var(--color-violet-900),transparent_40%)]",
  },
  amber: {
    border: "bg-[radial-gradient(300px_circle_at_var(--x)_var(--y),var(--color-amber-300),transparent_45%)]",
    surface: "bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),var(--color-amber-900),transparent_40%)]",
  },
};

export function SpotlightCard({
  children,
  tone = "neutral",
  className,
  contentClassName,
}: {
  children: ReactNode;
  tone?: keyof typeof spotlightTones;
  className?: string;
  contentClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = spotlightTones[tone];

  return (
    <div
      ref={ref}
      data-slot="spotlight-card"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn("group relative rounded-2xl bg-base-50/10 p-px", className)}
    >
      <div className={cn("pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-60", t.border)} />
      <div className={cn("relative h-full overflow-hidden rounded-[calc(1rem-1px)] bg-base-950 inset-shadow-2xs inset-shadow-white/5", contentClassName)}>
        <div className={cn("pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-30", t.surface)} />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

const features = [
  { icon: Gauge, title: "Instant", body: "Under 2kb per component. No runtime, no provider.", tone: "neutral" },
  { icon: Layers, title: "Composable", body: "Small parts you rearrange, not a black box.", tone: "blue" },
  { icon: ShieldCheck, title: "Accessible", body: "Keyboard, focus and ARIA handled for you.", tone: "violet" },
] as const;

export default function Demo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, body, tone }) => (
        <SpotlightCard key={title} tone={tone}>
          <div className="p-5">
            <span className="grid size-9 place-items-center rounded-xl bg-base-900 text-base-300 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10">
              <Icon className="size-4" />
            </span>
            <p className="mt-8 text-sm font-medium text-base-100">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-base-500">{body}</p>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
}
