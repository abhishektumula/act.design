import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlockItem } from "@/registry/meta";
import { BlockThumb } from "./block-frame";

export function BlockCard({ block, className }: { block: BlockItem; className?: string }) {
  return (
    <Link
      href={`/blocks/${block.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-shade/40 hover:ring-base-50/20 ${className ?? ""}`}
    >
      <div className="p-1.5 pb-0">
        <BlockThumb slug={block.slug} className="aspect-[16/10] rounded-xl ring-1 ring-base-50/5" />
      </div>
      <div className="flex items-start justify-between gap-4 px-4 py-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-base-100">
            {block.name}
            {block.isNew && <span className="size-1.5 rounded-full bg-blue-500" aria-label="New" />}
          </p>
          <p className="mt-0.5 truncate text-xs text-base-500">{block.category}</p>
        </div>
        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-base-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-base-300" />
      </div>
    </Link>
  );
}
