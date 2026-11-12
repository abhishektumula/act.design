"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { keycapVariants } from "@/components/ui/keycap";
import { cn } from "@/lib/utils";

/** A link dressed as a Keycap, for navigation that should feel like a press. */
export function KeyLink({ href, tone, children, className }: { href: string; tone: "signal" | "paper" | "ink"; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn(keycapVariants({ tone, size: "lg" }), className)}>
      <span
        data-face
        className="relative flex w-full items-center justify-center gap-2 rounded-[13px] bg-linear-to-b from-(--face-a) to-(--face-b) font-medium whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.45),inset_0_-1px_0_rgb(0_0_0/0.08)] ring-1 ring-black/10 [&_svg]:size-4"
      >
        {children}
      </span>
    </Link>
  );
}
