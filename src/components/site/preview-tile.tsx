import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Preview } from "@/registry/previews";
import { Fit } from "./fit";
import { getItem } from "@/registry/meta";

/** A framed live specimen of a registry component. */
export function PreviewTile({ slug, className = "h-[420px]" }: { slug: string; className?: string }) {
  const item = getItem(slug);
  if (!item) return null;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-lg bg-base-950 ring-1 ring-base-50/[0.08] transition-[box-shadow] duration-300 hover:ring-base-50/20 ${className}`}
    >
      <Link
        href={`/components/${slug}`}
        className="relative z-10 flex items-center justify-between border-b border-base-50/[0.06] px-5 py-3.5"
      >
        <span className="flex items-center gap-3">
          <span className="text-[14px] font-medium tracking-tight text-base-100">{item.name}</span>
          {item.isNew && (
            <span className="rounded-[3px] px-1.5 py-px font-mono text-[10px] tracking-wider text-signal uppercase ring-1 ring-signal/30">
              New
            </span>
          )}
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase">
          <span className="max-sm:hidden">{item.category}</span>
          <ArrowUpRight className="size-3.5 transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-base-50" />
        </span>
      </Link>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 pt-4 pb-8">
        <Fit>
          <Preview slug={slug} />
        </Fit>
      </div>
    </div>
  );
}
