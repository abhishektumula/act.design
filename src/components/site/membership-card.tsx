"use client";

import { TiltCard } from "@/components/ui/tilt-card";

export function MembershipCard({ name, plan }: { name: string; plan: string }) {
  return (
    <TiltCard>
      <div className="relative aspect-[1.586] w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-br from-neutral-800 via-neutral-900 to-black p-6 shadow-2xl shadow-black ring-1 ring-white/15 inset-shadow-2xs inset-shadow-white/20 sm:w-96">
        <div className="absolute -top-24 -right-16 size-56 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 size-44 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-neutral-300">Tasteful UI</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.2em] text-neutral-50 uppercase ring-1 ring-white/20 inset-shadow-2xs inset-shadow-white/20">
              {plan}
            </span>
          </div>
          <div className="h-8 w-11 rounded-md bg-linear-to-br from-amber-200 via-amber-400 to-amber-600 ring-1 ring-amber-900/40 inset-shadow-2xs inset-shadow-white/50" />
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] tracking-widest text-neutral-500 uppercase">Member</p>
              <p className="text-[15px] font-medium text-neutral-100">{name}</p>
            </div>
            <p className="font-mono text-sm text-neutral-400">•••• 2026</p>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
