"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A link styled as a Button. */
export function KeyLink({ href, tone, children, className }: { href: string; tone: "signal" | "paper" | "ink"; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn(buttonVariants({ tone, size: "lg" }), className)}>
      {children}
    </Link>
  );
}
