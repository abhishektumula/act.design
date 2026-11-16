import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlockItem } from "@/registry/meta";
import { BlockThumb } from "./block-frame";

export function BlockCard({ block, className }: { block: BlockItem; className?: string }) {
  return (
    <Link
      href={`/blocks/${block.slug}`}
      className={`group flex flex-col overflow-hidden rounded-lg bg-base-950 ring-1 ring-base-50/[0.08] transition-[box-shadow] duration-300 hover:ring-base-50/20 ${className ?? ""}`}
    >
      <BlockThumb slug={block.slug} className="aspect-[16/10] border-b border-base-50/[0.06]" />
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="flex min-w-0 items-center gap-3 text-[14px] font-medium tracking-tight text-base-100">
          {block.name}
          {block.isNew && (
            <span className="text-[12px] font-medium text-signal">
              New
            </span>
          )}
        </p>
        <span className="flex shrink-0 items-center gap-2 text-[13px] text-base-500">
          {block.category}
          <ArrowUpRight className="size-3.5 transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-base-50" />
        </span>
      </div>
    </Link>
  );
}
