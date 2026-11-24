import Link from "next/link";
import { blocks, categories, registry } from "@/registry/meta";
import { Logo } from "./logo";

const head = "text-[13px] font-medium text-base-100";
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
    <footer className="relative mt-auto overflow-hidden">
      <div aria-hidden className="h-px bg-base-50/[0.08]" />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 pt-16 pb-10 lg:grid-cols-[1.2fr_3fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-base-500">
            Instruments for the interface. A small library of tactile React components. Copy, paste, keep the feel.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-md bg-base-900 px-2.5 py-1 text-xs text-base-400 ring-1 ring-base-50/[0.06]">
            <span className="size-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
            {registry.length} instruments · {blocks.length} blocks
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className={head}>{col.title}</p>
              <ul className="mt-4 space-y-2.5">
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
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 pb-6 text-[12px] text-base-500">
        <span>Built with React, Tailwind CSS and Motion</span>
        <span>© act.design · copy, paste, keep the feel</span>
      </div>
      {/* Oversized wordmark, fading into the page and cropped by its bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto -mb-[0.2em] max-w-[1400px] px-4 text-center text-[21vw] leading-[0.9] font-semibold tracking-[-0.06em] text-base-50/[0.05] select-none xl:text-[19rem]"
      >
        act.design
      </div>
    </footer>
  );
}
