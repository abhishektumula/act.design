"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CreditCard, LayoutGrid, LogOut, User } from "lucide-react";
import { signOut } from "@/app/actions";
import type { Account } from "@/lib/account";

export function AccountMenu({ user }: { user: Account }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-base-300 transition-colors hover:bg-base-50/5 hover:text-base-50";

  return (
    <div ref={root} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg bg-base-900 pr-3 pl-1.5 ring-1 ring-base-50/[0.08] transition-colors hover:ring-base-50/15"
      >
        <span className="grid size-6 place-items-center rounded-md bg-signal text-[11px] font-semibold text-white">
          {user.firstName[0]}
        </span>
        <span className="text-[13px] text-base-200">{user.firstName}</span>
        <span className="text-[12px] font-medium text-signal">
          MAX
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: -4, filter: "blur(2px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="absolute top-full right-0 z-50 mt-3 w-64 origin-top-right rounded-xl bg-base-950 p-1 shadow-2xl shadow-shade/40 ring-1 ring-base-50/10"
          >
            <div className="px-2.5 pt-2 pb-2.5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase">Signed in</p>
              <p className="mt-1.5 text-sm text-base-100">{user.name}</p>
              <p className="truncate text-xs text-base-500">{user.email}</p>
            </div>
            <div className="-mx-1 mb-1 h-px bg-base-50/[0.06]" />
            <Link href="/account" onClick={() => setOpen(false)} className={item}>
              <User className="size-4 opacity-80" /> Account
            </Link>
            <Link href="/components" onClick={() => setOpen(false)} className={item}>
              <LayoutGrid className="size-4 opacity-80" /> Components
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className={item}>
              <CreditCard className="size-4 opacity-80" /> Plan · {user.plan}
            </Link>
            <div className="-mx-1 my-1 h-px bg-base-50/[0.06]" />
            <form action={signOut}>
              <button className={`${item} text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300`}>
                <LogOut className="size-4 opacity-80" /> Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
