/** The member's access card: graphite stock, a mag stripe and a live status lamp. */
export function MembershipCard({ name, plan, since }: { name: string; plan: string; since: string }) {
  return (
    <div className="group relative aspect-[1.586] w-full max-w-sm overflow-hidden rounded-[22px] bg-linear-to-b from-[#3a3631] to-[#1a1815] p-6 text-[#f3efe6] shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_30px_60px_-24px_rgb(0_0_0/0.55)] ring-1 ring-black/40 transition-transform duration-500 hover:-translate-y-1 hover:-rotate-1 sm:w-96">
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
      <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-signal/30 blur-3xl" />
      <div className="absolute inset-x-0 top-[38%] h-9 bg-linear-to-b from-black/70 to-black/50" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="flex items-center gap-2.5">
            <span className="relative grid size-7 place-items-center rounded-full bg-linear-to-b from-white to-[#cfc8ba] shadow-[0_1px_0_white_inset,0_2px_6px_rgb(0_0_0/0.4)]">
              <span className="absolute top-[18%] left-1/2 h-[30%] w-[2.5px] -translate-x-1/2 rotate-[38deg] rounded-full bg-signal [transform-origin:50%_120%]" />
            </span>
            <span className="text-sm font-semibold tracking-[-0.02em]">act.design</span>
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
            <span className="size-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
            {plan} · Active
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#f3efe6]/50 uppercase">Member</p>
            <p className="mt-1 font-serif text-2xl italic">{name}</p>
          </div>
          <p className="text-right font-mono text-[10px] tracking-[0.14em] text-[#f3efe6]/50 uppercase">
            Since
            <br />
            <span className="text-[#f3efe6]/80">{since}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
