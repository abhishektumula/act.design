import Link from "next/link";

/** A tiny knob: the house mark. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-full bg-linear-to-b from-white to-base-800 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.15),0_4px_10px_-4px_rgb(0_0_0/0.3)] ring-1 ring-black/10 dark:from-base-600 dark:to-base-800 dark:ring-white/10 ${className}`}
    >
      <span className="absolute top-[18%] left-1/2 h-[30%] w-[2.5px] -translate-x-1/2 rotate-[38deg] rounded-full bg-signal [transform-origin:50%_120%]" />
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <LogoMark className="size-7 transition-transform duration-500 group-hover:rotate-[60deg]" />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-base-50">
        act<span className="text-base-500">.design</span>
      </span>
    </Link>
  );
}
