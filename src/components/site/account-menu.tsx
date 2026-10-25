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
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-base-300 transition-colors hover:bg-base-50/5 hover:text-base-50";

  return (
    <div ref={root} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-xl bg-base-900/80 pr-3 pl-1 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-colors hover:bg-base-800"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-linear-to-br from-amber-300 to-rose-500 text-xs font-semibold text-neutral-950 inset-shadow-2xs inset-shadow-white/50">
          {user.firstName[0]}
        </span>
        <span className="text-sm text-base-200">{user.firstName}</span>
        <span className="rounded-md bg-linear-to-b from-blue-500 to-blue-600 px-1.5 py-px text-[10px] font-semibold tracking-wider text-white ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30">
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
            className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-base-900 p-1.5 shadow-2xl shadow-shade/70 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
          >
            <div className="px-2.5 pt-1.5 pb-2.5">
              <p className="text-sm text-base-100">{user.name}</p>
              <p className="truncate text-xs text-base-500">{user.email}</p>
            </div>
            <div className="mx-2 mb-1.5 h-px bg-base-50/5" />
            <Link href="/account" onClick={() => setOpen(false)} className={item}>
              <User className="size-4 opacity-80" /> Account
            </Link>
            <Link href="/components" onClick={() => setOpen(false)} className={item}>
              <LayoutGrid className="size-4 opacity-80" /> Components
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className={item}>
              <CreditCard className="size-4 opacity-80" /> Plan · {user.plan}
            </Link>
            <div className="mx-2 my-1.5 h-px bg-base-50/5" />
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
