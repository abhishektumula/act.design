import Link from "next/link";
import { blocks, categories, registry } from "@/registry/meta";
import { Logo } from "./logo";

const head = "font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase";
const link = "text-[13px] text-base-400 transition-colors hover:text-base-50";

export function Footer() {
  const columns = [
    ...categories.map((cat) => ({
      title: cat,
      items: registry.filter((r) => r.category === cat).map((r) => ({ name: r.name, href: `/components/${r.slug}` })),
    })),
    { title: "Blocks", items: blocks.map((b) => ({ name: b.name, href: `/blocks/${b.slug}` })) },
    {
      title: "Site",
      items: [
        { name: "Setup", href: "/setup" },
        { name: "Pricing", href: "/pricing" },
        { name: "Account", href: "/account" },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-base-50/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-px border-x border-base-50/[0.06] bg-base-50/[0.06] lg:grid-cols-[1.3fr_3fr]">
          <div className="bg-canvas p-8">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-base-500">
              Instruments for the interface. A small library of tactile React components. Copy, paste, keep the feel.
            </p>
            <p className="mt-8 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase">
              <span className="size-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
              {registry.length} instruments · {blocks.length} blocks
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="bg-canvas p-6">
                <p className={head}>{col.title}</p>
                <ul className="mt-5 space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={link}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* Fill the last row so the hairline grid stays closed. */}
            <div className="bg-canvas" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-x border-t border-base-50/[0.06] px-8 py-5 font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase">
          <span>Built with React, Tailwind CSS and Motion</span>
          <span>act.design · copy, paste, keep the feel</span>
        </div>
      </div>
      {/* Oversized wordmark, cropped by the bottom edge of the page */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto -mb-[0.14em] max-w-[1400px] border-t border-base-50/[0.06] px-4 pt-6 text-center font-serif text-[25vw] leading-[0.8] tracking-[-0.04em] text-base-50/[0.06] italic select-none xl:text-[22rem]"
      >
        act.design
      </div>
    </footer>
  );
}
