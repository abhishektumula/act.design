"use client";

import { motion } from "motion/react";
import { Aperture, Atom, Boxes, Cloud, Command, Feather, Flame, Hexagon, Infinity as InfinityIcon, Layers, Orbit, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

const logos = [
  { icon: Triangle, name: "Vertex" },
  { icon: Hexagon, name: "Hexa" },
  { icon: Atom, name: "Quanta" },
  { icon: Aperture, name: "Lumina" },
  { icon: Flame, name: "Ember" },
  { icon: Layers, name: "Stackly" },
  { icon: Orbit, name: "Orbital" },
  { icon: Feather, name: "Quill" },
  { icon: Boxes, name: "Cubic" },
  { icon: Cloud, name: "Nimbus" },
  { icon: Command, name: "Keystone" },
  { icon: InfinityIcon, name: "Loop" },
];

function Row({ items, reverse, duration }: { items: typeof logos; reverse?: boolean; duration: number }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex shrink-0 gap-14 pr-14"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map(({ icon: Icon, name }, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-base-500 transition-colors hover:text-base-100"
          >
            <Icon className="size-5" /> {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function LogoCloud({
  title = "Trusted by 4,000+ product teams",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <section data-slot="logo-cloud" className={cn("bg-canvas px-6 py-20", className)}>
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm text-base-500">{title}</p>
        <div className="mt-10 space-y-8">
          <Row items={logos.slice(0, 6)} duration={28} />
          <Row items={logos.slice(6)} duration={32} reverse />
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <LogoCloud />;
}
