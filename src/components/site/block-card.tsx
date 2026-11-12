import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlockItem } from "@/registry/meta";
import { BlockThumb } from "./block-frame";

export function BlockCard({ block, className }: { block: BlockItem; className?: string }) {
  return (
    <Link
      href={`/blocks/${block.slug}`}
      className={`group flex flex-col overflow-hidden rounded-[28px] bg-base-950 p-2 shadow-[0_1px_0_white_inset,0_24px_48px_-36px_var(--color-shade)] ring-1 ring-base-50/[0.08] transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:ring-base-50/15 dark:shadow-[0_1px_0_rgb(255_255_255/0.05)_inset] ${className ?? ""}`}
    >
      <div>
        <BlockThumb slug={block.slug} className="aspect-[16/10] rounded-[20px] ring-1 ring-base-50/[0.06]" />
      </div>
      <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[15px] font-medium tracking-tight text-base-100">
            {block.name}
            {block.isNew && <span className="size-1.5 rounded-full bg-signal" aria-label="New" />}
          </p>
          <p className="mt-0.5 text-xs text-base-500">{block.category}</p>
        </div>
        <span className="grid size-7 shrink-0 place-items-center rounded-full text-base-500 ring-1 ring-base-50/10 transition-all duration-300 group-hover:bg-base-50 group-hover:text-base-950 group-hover:ring-base-50">
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
