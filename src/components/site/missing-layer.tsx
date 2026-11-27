"use client";

import { useEffect, useMemo, useSyncExternalStore, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, ChevronRight, CornerDownLeft, EyeOff, File, Folder, Frame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "./fx";
import { btnPrimary, btnSecondary } from "./styles";

export type SiteNode = { name: string; href: string; children?: SiteNode[] };

type Row =
  | { kind: "page" | "folder"; node: SiteNode; depth: number; open?: boolean; count?: number }
  | { kind: "missing"; name: string; depth: number }
  | { kind: "gap"; hidden: number; depth: number };

const enter = [0.22, 1, 0.36, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: enter },
});

/* ------------------------------- matching -------------------------------- */

/** Edit distance where swapping two neighbouring letters ("dail" for "dial") costs one edit. */
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const last = (href: string) => href.split("/").filter(Boolean).pop() ?? "";

/** How far a page is from what was typed, 0 (same) to 1 (nothing alike). */
function score(typed: string, node: SiteNode) {
  if (!typed) return 1;
  const keys = [last(node.href), slug(node.name)].filter(Boolean);
  let best = 1;
  for (const k of keys) {
    best = Math.min(best, distance(typed, k) / Math.max(typed.length, k.length));
    if (typed.length > 2 && k.includes(typed)) best = Math.min(best, 0.15);
  }
  return best;
}

const words = ["", "one", "two", "three", "four", "five", "six"];

/* ------------------------------- the panel ------------------------------- */

const subscribe = () => () => {};

/**
 * The site's 404, drawn as a design tool would show a page that isn't there: an empty
 * selection where the headline's layer should be, and the site's pages as a layers
 * panel with the missing one as a hidden layer, between the pages it was probably
 * meant to be.
 */
export function MissingLayer({ sections }: { sections: SiteNode[] }) {
  const router = useRouter();
  const path = useSyncExternalStore(
    subscribe,
    () => decodeURIComponent(window.location.pathname).replace(/\/+$/, "") || "/",
    () => null,
  );

  const view = useMemo(() => {
    const p = path ?? "";
    const segs = p.split("/").filter(Boolean);
    const typed = slug(segs.at(-1) ?? "");
    const parent = "/" + segs.slice(0, -1).join("/");
    const folder = sections.find((s) => s.children && s.href === parent);

    // The closest pages anywhere on the site, best first.
    const everything = sections.flatMap((s) => [s, ...(s.children ?? [])]);
    const near = everything
      .map((node) => ({ node, d: score(typed, node) }))
      .filter((x) => x.d < 0.5)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .map((x) => x.node);
    const best = near[0];

    const missing: Row = { kind: "missing", name: folder ? segs.at(-1) ?? "" : p, depth: folder ? 1 : 0 };
    const rows: Row[] = [];
    for (const s of sections) {
      const open = s === folder || (!folder && near.some((n) => s.children?.includes(n)));
      rows.push({ kind: s.children ? "folder" : "page", node: s, depth: 0, open, count: s.children?.length });
      if (!open || !s.children) continue;

      // The folder's pages in name order, with the missing one slotted in where it would sort.
      const kids = [...s.children].sort((a, b) => a.name.localeCompare(b.name));
      const items: Row[] = kids.map((node) => ({ kind: "page", node, depth: 1 }));
      let at = -1;
      if (s === folder) {
        at = kids.findIndex((k) => slug(k.name).localeCompare(typed) > 0);
        if (at < 0) at = kids.length;
        items.splice(at, 0, missing);
      }
      // Keep a few rows either side of it, and the closest pages; fold the rest.
      const centre = at >= 0 ? at : items.findIndex((r) => r.kind === "page" && near.includes(r.node));
      const keep = items.map((r, i) => Math.abs(i - centre) <= 3 || (r.kind === "page" && near.includes(r.node)));
      let hidden = 0;
      items.forEach((r, i) => {
        if (keep[i]) {
          if (hidden) rows.push({ kind: "gap", hidden, depth: 1 });
          hidden = 0;
          rows.push(r);
        } else hidden++;
      });
      if (hidden) rows.push({ kind: "gap", hidden, depth: 1 });
    }
    if (!folder) rows.push(missing);

    // Where the best match sits relative to the missing layer, for the copy.
    const mi = rows.indexOf(missing);
    const bi = rows.findIndex((r) => r.kind !== "missing" && r.kind !== "gap" && r.node === best);
    const gap = bi - mi;
    const hint = !best
      ? "It may have been renamed, or it never existed."
      : bi >= 0 && Math.abs(gap) < words.length && !rows.slice(Math.min(bi, mi), Math.max(bi, mi)).some((r) => r.kind === "gap")
        ? `${best.name} is ${words[Math.abs(gap)]} ${Math.abs(gap) === 1 ? "layer" : "layers"} ${gap < 0 ? "up" : "down"}, if that's the one.`
        : `The closest match is ${best.name}.`;

    return { rows, near, best, hint, name: missing.name || "/" };
  }, [path, sections]);

  const open = view.best ?? sections.find((s) => s.children) ?? sections[0];

  // Enter opens the suggestion, like confirming the selected layer.
  useEffect(() => {
    const down = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || (t && (t.closest("a,button,input,textarea,select,[contenteditable]") || t.isContentEditable))) return;
      router.push(open.href);
    };
    addEventListener("keydown", down);
    return () => removeEventListener("keydown", down);
  }, [open.href, router]);

  const onTreeKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>("a")];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = i < 0 ? 0 : e.key === "ArrowDown" ? Math.min(links.length - 1, i + 1) : Math.max(0, i - 1);
    links[next]?.focus();
  };

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="relative mx-auto grid max-w-[1400px] gap-y-14 px-6 pt-14 pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-x-12">
        {/* The headline: a selection with nothing in it */}
        <div className="pl-4 lg:col-span-6 lg:self-center lg:pb-16">
          <motion.div {...rise(0)}>
            <Chip label="404" count="Not found" className="mb-9" />
          </motion.div>
          <h1 className="relative block w-fit text-[clamp(3rem,5.4vw,5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-neutral-950 dark:text-neutral-50">
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.55, ease: enter }}
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 border border-dashed border-blue-600/60 dark:border-blue-500/60"
            >
              {["-top-[4px] -left-[4px]", "-top-[4px] -right-[4px]", "-bottom-[4px] -left-[4px]", "-right-[4px] -bottom-[4px]"].map((at) => (
                <span key={at} className={`absolute size-[7px] border border-blue-600 bg-white dark:border-blue-500 dark:bg-black ${at}`} />
              ))}
              <span className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2 rounded-[4px] bg-blue-600 px-1.5 py-[3px] font-mono text-[11px] leading-none text-white dark:bg-blue-500">
                0 × 0
              </span>
            </motion.span>
            <motion.span {...rise(0.05)} className="block">
              Nothing on
            </motion.span>
            <motion.span {...rise(0.15)} className="block">
              this <span className="inline-block pr-[0.08em] font-serif font-normal tracking-[-0.02em] text-blue-600 italic dark:text-blue-500">layer.</span>
            </motion.span>
          </h1>

          <motion.div {...rise(0.3)}>
            <p className="mt-14 max-w-[30rem] text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
              There&apos;s no page at{" "}
              <span className="font-mono text-[15px] text-neutral-900 dark:text-neutral-100">
                {/* Wrap a long path at its slashes, never mid-word */}
                {(path ?? "this address").split(/(?=\/)/).map((part, i) => (
                  <span key={i}>
                    <wbr />
                    {part}
                  </span>
                ))}
              </span>
              .{" "}
              {path !== null && <span className="text-neutral-900 dark:text-neutral-100">{view.hint}</span>}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/" className={`${btnPrimary} group h-11 rounded-lg px-5 text-[15px]`}>
                Back to the start <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/components" className={`${btnSecondary} h-11 rounded-lg px-5 text-[15px]`}>
                Browse the components
              </Link>
            </div>
          </motion.div>
        </div>

        {/* The layers panel, running off the right edge of the page */}
        <motion.div
          {...rise(0.4)}
          className="-mr-6 lg:col-span-6 lg:col-start-7 lg:mr-[calc(-1.5rem-max(0px,(100vw-1400px)/2))]"
        >
          <div className="overflow-hidden rounded-tl-[14px] bg-neutral-50 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)]">
            <div className="flex h-11 items-center gap-[7px] border-b border-neutral-950/[0.07] px-4 dark:border-neutral-50/[0.07]">
              {["var(--color-red-400)", "var(--color-amber-400)", "var(--color-green-500)"].map((c) => (
                <span key={c} className="size-[10px] rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-4 text-[14px] font-medium text-neutral-900 dark:text-neutral-100">Layers</span>
            </div>

            <div className="grid min-h-[26rem] sm:grid-cols-[17rem_1fr]">
              <ul
                aria-label="Pages on this site"
                onKeyDown={onTreeKey}
                className={cn("py-3 text-[13px] transition-opacity duration-300 sm:border-r sm:border-neutral-950/[0.07] sm:dark:border-neutral-50/[0.07]", path === null && "opacity-0")}
              >
                {view.rows.map((r, i) => {
                  const pad = { paddingLeft: 30 + r.depth * 18 };
                  if (r.kind === "gap")
                    return (
                      <li key={`gap-${i}`} style={pad} className="flex h-7 items-center text-[12px] text-neutral-400 dark:text-neutral-600">
                        <span className="tracking-[0.2em]">···</span>
                        <span className="ml-2 tracking-normal">{r.hidden} more</span>
                      </li>
                    );
                  if (r.kind === "missing")
                    return (
                      <li key="missing" aria-current="page" className="px-1.5">
                        <span
                          style={{ paddingLeft: 24 + r.depth * 18 }}
                          className="flex h-8 items-center gap-2 rounded-[6px] pr-2.5 text-blue-600 outline-1 -outline-offset-1 outline-blue-600/70 outline-dashed dark:text-blue-500 dark:outline-blue-500/70"
                        >
                          <Frame className="size-3.5 shrink-0" />
                          <span className="flex-1 truncate font-mono">{r.name}</span>
                          <EyeOff className="size-3.5 shrink-0" aria-label="Missing" />
                        </span>
                      </li>
                    );
                  const isNear = view.near.includes(r.node);
                  const Chevron = r.open ? ChevronDown : ChevronRight;
                  return (
                    <li key={r.node.href} className="px-1.5">
                      <Link
                        href={r.node.href}
                        style={{ paddingLeft: 24 + r.depth * 18 }}
                        className={cn(
                          "group relative flex h-8 items-center gap-2 rounded-[6px] pr-2.5 outline-none transition-colors hover:bg-neutral-950/[0.04] focus-visible:bg-neutral-950/[0.05] focus-visible:ring-1 focus-visible:ring-blue-600/60 dark:hover:bg-neutral-50/[0.04] dark:focus-visible:bg-neutral-50/[0.06] dark:focus-visible:ring-blue-500/60",
                          isNear ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-700 dark:text-neutral-300",
                        )}
                      >
                        {r.kind === "folder" && <Chevron className="absolute size-3 text-neutral-500" style={{ left: 8 + r.depth * 18 }} />}
                        {r.kind === "folder" ? <Folder className="size-3.5 shrink-0 text-neutral-500" /> : <File className="size-3.5 shrink-0 text-neutral-500" />}
                        <span className="flex-1 truncate">{r.node.name}</span>
                        {isNear && <span className="text-[11px] text-neutral-500">closest</span>}
                        {r.count !== undefined && !isNear && <span className="text-[11px] text-neutral-500 tabular-nums">{r.count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Properties of the selected (missing) layer */}
              <div className={cn("hidden p-6 transition-opacity duration-300 sm:block", path === null && "opacity-0")}>
                <p className="text-[11px] font-medium tracking-[0.08em] text-neutral-500 uppercase">Layer</p>
                <dl className="mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-y-3 text-[13px]">
                  {[
                    ["Name", view.name],
                    ["Route", path ?? ""],
                    ["Size", "0 × 0"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="truncate font-mono text-neutral-900 dark:text-neutral-100">{v}</dd>
                    </div>
                  ))}
                  <dt className="text-neutral-500">Status</dt>
                  <dd className="font-mono text-blue-600 dark:text-blue-500">404</dd>
                </dl>
                <div className="my-6 h-px bg-neutral-950/[0.07] dark:bg-neutral-50/[0.07]" />
                <p className="text-[11px] font-medium tracking-[0.08em] text-neutral-500 uppercase">{view.best ? "Did you mean" : "Start from"}</p>
                <Link
                  href={open.href}
                  className="group mt-3 flex items-center justify-between gap-3 rounded-[10px] bg-white px-3 py-2.5 text-[13px] ring-1 ring-neutral-950/[0.08] outline-none transition-shadow hover:ring-neutral-950/15 focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:bg-neutral-950 dark:ring-neutral-50/[0.08] dark:hover:ring-neutral-50/15 dark:focus-visible:ring-blue-500/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-neutral-950 dark:text-neutral-50">{open.name}</span>
                    <span className="block truncate font-mono text-[11px] text-neutral-500">{open.href}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-neutral-500 transition-colors group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                    Open
                    <kbd className="grid h-5 min-w-5 place-items-center rounded-[5px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.08]">
                      <CornerDownLeft className="size-3" />
                    </kbd>
                  </span>
                </Link>
                <div className="mt-7 space-y-3" aria-hidden>
                  {[62, 40, 72, 48].map((w) => (
                    <span key={w} className="block h-2 rounded-full bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
