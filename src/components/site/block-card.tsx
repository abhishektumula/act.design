import Link from "next/link";
import type { BlockItem } from "@/registry/meta";
import { BlockThumb } from "./block-frame";
import { cn } from "@/lib/utils";

export function BlockCard({ block, className }: { block: BlockItem; className?: string }) {
  return (
    <Link
      href={`/blocks/${block.slug}`}
      data-glow
      className={cn("group flex flex-col rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 p-2 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06] transition-colors hover:ring-neutral-950/[0.12] dark:hover:ring-neutral-50/[0.12]", className)}
    >
      <BlockThumb slug={block.slug} className="aspect-[16/10] rounded-xl ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]" />
      <div className="px-3 pt-4 pb-2">
        <p className="flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-[-0.015em] text-neutral-950 dark:text-neutral-50">{block.name}</span>
          {block.isNew ? (
            <span className="rounded-md bg-blue-600/10 dark:bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-500 ring-1 ring-blue-600/25 dark:ring-blue-500/25">New</span>
          ) : (
            <span className="rounded-md px-1.5 py-0.5 text-xs text-neutral-600 dark:text-neutral-400 ring-1 ring-neutral-950/10 dark:ring-neutral-50/10">{block.category}</span>
          )}
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400 transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-300">{block.description}</p>
      </div>
    </Link>
  );
}
