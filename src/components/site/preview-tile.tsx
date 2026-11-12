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
      className={`group relative flex flex-col overflow-hidden rounded-[28px] bg-base-950 shadow-[0_1px_0_white_inset,0_24px_48px_-36px_var(--color-shade)] ring-1 ring-base-50/[0.08] transition-[box-shadow] duration-300 hover:ring-base-50/15 dark:shadow-[0_1px_0_rgb(255_255_255/0.05)_inset] ${className}`}
    >

      <Link href={`/components/${slug}`} className="relative z-10 flex items-start justify-between px-6 pt-5">
        <span className="flex items-baseline gap-3">
          <span className="text-[15px] font-medium tracking-tight text-base-100">{item.name}</span>
          {item.isNew && <span className="size-1.5 -translate-y-0.5 rounded-full bg-signal" aria-label="New" />}
        </span>
        <span className="grid size-7 place-items-center rounded-full text-base-500 ring-1 ring-base-50/10 transition-all duration-300 group-hover:bg-base-50 group-hover:text-base-950 group-hover:ring-base-50">
          <ArrowUpRight className="size-3.5" />
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
