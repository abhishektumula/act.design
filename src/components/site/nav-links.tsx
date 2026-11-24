"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { blocks, categories, registry } from "@/registry/meta";
import { BlockThumb } from "./block-frame";
import { Fit } from "./fit";
import { NewMark } from "./fx";

/* Live demos load only once a menu opens, so the bar stays light on every page. */
const Preview = dynamic(() => import("@/registry/previews").then((m) => m.Preview), { ssr: false });

type MenuId = "instruments" | "blocks";
type Entry = { slug: string; name: string; href: string; group: string; isNew?: boolean };

const menus: Record<MenuId, { label: string; heading: string; href: string; all: string; entries: Entry[] }> = {
  instruments: {
    label: "Instruments",
    heading: "Instruments by kind",
    href: "/components",
    all: `Browse all ${registry.length} instruments`,
    // Grouped by category, in the sidebar's order
    entries: categories.flatMap((cat) =>
      registry
        .filter((r) => r.category === cat)
        .map((r) => ({ slug: r.slug, name: r.name, href: `/components/${r.slug}`, group: r.category, isNew: r.isNew })),
    ),
  },
  blocks: {
    label: "Blocks",
    heading: "Blocks by section",
    href: "/blocks",
    all: `Browse all ${blocks.length} blocks`,
    entries: blocks.map((b) => ({ slug: b.slug, name: b.name, href: `/blocks/${b.slug}`, group: b.category, isNew: b.isNew })),
  },
};

const plain = [
  { href: "/setup", label: "Setup" },
  { href: "/pricing", label: "Pricing" },
];

/** The newest entry: the one the preview opens on. */
const newest = (entries: Entry[]) => entries.filter((e) => e.isNew).at(-1) ?? entries[0];

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState<MenuId | null>(null);
  const [hover, setHover] = useState<Entry | null>(null);
  const timer = useRef<number>(0);
  const root = useRef<HTMLDivElement>(null);

  const show = (id: MenuId, delay = 90) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(id);
      setHover((h) => (h && menus[id].entries.includes(h) ? h : newest(menus[id].entries)));
    }, delay);
  };
  const hide = (delay = 160) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), delay);
  };

  // Close on route change, Escape and outside clicks.
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOpen(null);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const link = (on: boolean) => `flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${on ? "text-base-50" : "text-base-400 hover:text-base-50"}`;
  const menu = open ? menus[open] : null;

  return (
    <div ref={root} className="relative hidden items-center gap-1 md:flex" onPointerLeave={() => hide()}>
      {(Object.keys(menus) as MenuId[]).map((id) => (
        <button
          key={id}
          type="button"
          aria-expanded={open === id}
          aria-haspopup="true"
          onPointerEnter={(e) => e.pointerType === "mouse" && show(id, open ? 0 : 90)}
          onClick={() => (open === id ? setOpen(null) : show(id, 0))}
          className={link(open === id || active(menus[id].href))}
        >
          {menus[id].label}
          <ChevronDown className={`size-3.5 transition-transform duration-200 ${open === id ? "rotate-180" : ""}`} />
        </button>
      ))}
      {plain.map((l) => (
        <Link key={l.href} href={l.href} onPointerEnter={() => hide(60)} aria-current={active(l.href) ? "page" : undefined} className={link(active(l.href))}>
          {l.label}
        </Link>
      ))}

      <AnimatePresence>
        {menu && open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            className="absolute top-full left-0 z-50 mt-3 grid w-[min(60rem,calc(100vw-10rem))] origin-top-left grid-cols-[1fr_18rem] gap-2 rounded-2xl bg-base-950 p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-base-50/10"
          >
            <div className="rounded-xl bg-base-900/70 p-5 ring-1 ring-base-50/[0.05]">
              <p className="px-3 text-sm text-base-500">{menu.heading}</p>
              <ul className="mt-3 grid grid-cols-3 gap-1">
                {menu.entries.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={e.href}
                      onPointerEnter={() => setHover(e)}
                      onFocus={() => setHover(e)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                        hover?.slug === e.slug ? "bg-base-800/80 text-base-50" : "text-base-300 hover:text-base-50"
                      }`}
                    >
                      <span className="truncate">{e.name}</span>
                      {e.isNew && <NewMark />}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={menu.href} className="group mt-4 inline-flex items-center gap-1.5 px-3 text-[15px] font-medium text-base-50">
                {menu.all} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* What you are pointing at */}
            {hover && (
              <Link href={hover.href} className="group flex flex-col rounded-xl p-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-canvas ring-1 ring-base-50/[0.08]">
                  {open === "blocks" ? (
                    <BlockThumb key={hover.slug} slug={hover.slug} className="size-full" />
                  ) : (
                    <div inert className="pointer-events-none flex size-full items-center justify-center p-3">
                      <Fit key={hover.slug}>
                        <Preview slug={hover.slug} />
                      </Fit>
                    </div>
                  )}
                </div>
                <p className="mt-3 px-1 text-base font-semibold text-base-50">{hover.name}</p>
                <p className="px-1 text-sm text-base-500">{hover.isNew ? `Newest in ${hover.group}` : hover.group}</p>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
