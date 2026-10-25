"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { Calendar, Compass, FolderOpen, Mail, Music2, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; icon: LucideIcon };

function DockIcon({
  item,
  mouseX,
  base,
  magnified,
  className,
}: {
  item: Item;
  mouseX: MotionValue<number>;
  base: number;
  magnified: number;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - r.x - r.width / 2;
  });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [base, magnified, base]), { stiffness: 300, damping: 22, mass: 0.2 });
  const iconSize = useTransform(size, (s) => s * 0.45);
  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      aria-label={item.label}
      style={{ width: size, height: size }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      whileTap={{ scale: 0.9 }}
      className={cn("relative grid place-items-center rounded-2xl bg-linear-to-b from-base-700 to-base-800 text-base-200 shadow-lg shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/20", className)}
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, x: "-50%", filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, x: "-50%", filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 left-1/2 rounded-md bg-base-800 px-2 py-1 text-xs whitespace-nowrap text-base-100 ring-1 ring-base-50/10"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span style={{ width: iconSize, height: iconSize }} className="grid place-items-center">
        <Icon className="size-full" strokeWidth={1.6} />
      </motion.span>
    </motion.button>
  );
}

export function Dock({
  items,
  baseSize = 40,
  magnifiedSize = 64,
  className,
  itemClassName,
}: {
  items: Item[];
  /** Icon size at rest, in px. */
  baseSize?: number;
  /** Icon size directly under the cursor, in px. */
  magnifiedSize?: number;
  className?: string;
  itemClassName?: string;
}) {
  const mouseX = useMotionValue(Infinity);
  return (
    <div
      onPointerMove={(e) => mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(Infinity)}
      data-slot="dock"
      style={{ height: baseSize + 32 }}
      className={cn("flex items-end gap-3 rounded-3xl bg-base-900/80 px-3 pb-3 shadow-2xl shadow-shade/60 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 backdrop-blur-xl", className)}
    >
      {items.map((item) => (
        <DockIcon key={item.label} item={item} mouseX={mouseX} base={baseSize} magnified={magnifiedSize} className={itemClassName} />
      ))}
    </div>
  );
}

export default function Demo() {
  return (
    <div className="flex h-40 items-end">
      <Dock
        items={[
          { label: "Finder", icon: FolderOpen },
          { label: "Safari", icon: Compass },
          { label: "Mail", icon: Mail },
          { label: "Calendar", icon: Calendar },
          { label: "Music", icon: Music2 },
          { label: "Settings", icon: Settings },
        ]}
      />
    </div>
  );
}
