import Link from "next/link";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-lg bg-linear-to-b from-base-700 to-base-900 ring-1 ring-base-50/15 inset-shadow-2xs inset-shadow-white/25 shadow-md shadow-shade/50 ${className}`}
    >
      <span className="size-2.5 rounded-[3px] bg-linear-to-br from-sky-300 to-blue-600 shadow-sm shadow-blue-500/60" />
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-base-50">Tasteful UI</span>
    </Link>
  );
}
