import Link from "next/link";

/*
 * The house mark: three plates stacked flush, so at rest it reads as one flat plane.
 * Hover (on the mark, or on the Logo link around it) tilts the stack isometrically —
 * a quarter-turn on Z, then laid back on X — and the plates lift apart on Z, so the
 * layers that make the plane show themselves. Pure CSS; no JS, no layout shift.
 *
 * Every hover rule is written twice, once for the mark's own group and once for the
 * Logo link's group, because Tailwind needs the class names spelled out in full.
 */

const plate = "absolute inset-0 rounded-[28%] transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform backface-hidden";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <span aria-hidden className={`group/mark relative inline-block shrink-0 ${className}`}>
      <span
        className={[
          "absolute inset-0 transform-3d transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform",
          "group-hover/mark:[transform:translateY(12%)_rotateX(56deg)_rotateZ(-45deg)_scale(.78)]",
          "group-hover:[transform:translateY(12%)_rotateX(56deg)_rotateZ(-45deg)_scale(.78)]",
          "group-focus-visible:[transform:translateY(12%)_rotateX(56deg)_rotateZ(-45deg)_scale(.78)]",
        ].join(" ")}
      >
        {/* Base plate: ink. Throws the ground shadow once the stack opens. */}
        <span
          className={[
            plate,
            "bg-linear-to-b from-neutral-800 dark:from-neutral-200 to-neutral-950 dark:to-neutral-50 shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.12)]",
            "group-hover/mark:shadow-[0_0_0_1px_rgb(0_0_0/0.15),2px_2px_6px_rgb(0_0_0/0.3)]",
            "group-hover:shadow-[0_0_0_1px_rgb(0_0_0/0.15),2px_2px_6px_rgb(0_0_0/0.3)]",
          ].join(" ")}
        />

        {/* Middle plate: frosted glass with a hairline, hidden under the top plate at rest. */}
        <span
          className={[
            plate,
            "bg-neutral-950/10 dark:bg-neutral-50/10 opacity-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_30%,transparent)] dark:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_30%,transparent)]",
            "group-hover/mark:opacity-100 group-hover/mark:[transform:translateZ(calc(var(--lift)*1))]",
            "group-hover:opacity-100 group-hover:[transform:translateZ(calc(var(--lift)*1))]",
            "group-focus-visible:opacity-100 group-focus-visible:[transform:translateZ(calc(var(--lift)*1))]",
          ].join(" ")}
          style={{ ["--lift" as string]: "0.28em" }}
        />

        {/* Top plate: the signal face — the plane you see at rest. */}
        <span
          className={[
            plate,
            "overflow-hidden bg-blue-600 dark:bg-blue-500 bg-linear-to-b from-white/22 to-white/0",
            "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-600)_70%,black),0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_0_0/0.15)] dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-blue-500)_70%,black),0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_0_0/0.15)]",
            "group-hover/mark:[transform:translateZ(calc(var(--lift)*2))]",
            "group-hover:[transform:translateZ(calc(var(--lift)*2))]",
            "group-focus-visible:[transform:translateZ(calc(var(--lift)*2))]",
          ].join(" ")}
          style={{ ["--lift" as string]: "0.28em" }}
        >
          {/* A corner handle, like a selected layer's anchor point. */}
          <span className="absolute top-[22%] left-[22%] size-[22%] rounded-full bg-white shadow-[0_1px_1px_rgb(0_0_0/0.25)]" />
          {/* Fold line: a faint diagonal crease that hints the plane is made of sheets. */}
          <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_55%,rgb(255_255_255/0.14)_55%,rgb(255_255_255/0.14)_56%,transparent_56%)]" />
        </span>
      </span>
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 outline-none">
      {/* font-size sets the lift distance (em) so the unfold scales with the mark. */}
      <LogoMark className="size-7 text-[28px]" />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
        act<span className="text-neutral-500">.design</span>
      </span>
    </Link>
  );
}
