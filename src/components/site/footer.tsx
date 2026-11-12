import Link from "next/link";
import { blocks, categories, registry } from "@/registry/meta";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-base-50/[0.06]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 pt-16 pb-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-base-500">
            Instruments for the interface. A small library of tactile React components. Copy, paste, keep the feel.
          </p>
        </div>
        {[categories.slice(0, 2), categories.slice(2, 4), categories.slice(4)].map((group, i) => (
          <div key={i} className="space-y-8">
            {group.map((cat) => (
              <div key={cat}>
                <p className="text-xs font-medium text-base-300">{cat}</p>
                <ul className="mt-4 space-y-2.5">
                  {registry
                    .filter((r) => r.category === cat)
                    .map((r) => (
                      <li key={r.slug}>
                        <Link href={`/components/${r.slug}`} className="text-sm text-base-500 transition-colors hover:text-base-100">
                          {r.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            {i === 2 && (
              <div>
                <p className="text-xs font-medium text-base-300">Blocks</p>
                <ul className="mt-4 space-y-2.5">
                  {blocks.slice(0, 4).map((b) => (
                    <li key={b.slug}>
                      <Link href={`/blocks/${b.slug}`} className="text-sm text-base-500 transition-colors hover:text-base-100">
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="relative mx-auto flex max-w-[1400px] items-center justify-between border-t border-base-50/[0.06] px-6 py-6 text-xs text-base-500">
        <span>Built with React, Tailwind CSS and Motion</span>
        <span>
          {registry.length} instruments · {blocks.length} blocks
        </span>
      </div>
      {/* Oversized wordmark, cropped by the bottom edge of the page */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto -mb-[0.14em] max-w-[1400px] px-4 pt-6 text-center font-serif text-[25vw] leading-[0.8] tracking-[-0.04em] text-base-50/[0.06] italic select-none xl:text-[22rem]"
      >
        act.design
      </div>
    </footer>
  );
}
