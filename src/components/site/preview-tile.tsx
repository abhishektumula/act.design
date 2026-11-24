import Link from "next/link";
import { Preview } from "@/registry/previews";
import { Fit } from "./fit";
import { getItem } from "@/registry/meta";
import { cn } from "@/lib/utils";

/** A live specimen of a registry component: the stage on top, its name and what it does below. */
export function PreviewTile({ slug, className = "h-[420px]" }: { slug: string; className?: string }) {
  const item = getItem(slug);
  if (!item) return null;

  return (
    <article className={cn("group flex flex-col rounded-2xl bg-base-900/60 p-2 ring-1 ring-base-50/[0.06] transition-colors hover:ring-base-50/[0.12]", className)}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-canvas px-6 py-6 ring-1 ring-base-50/[0.06]">
        <Fit>
          <Preview slug={slug} />
        </Fit>
      </div>
      <Link href={`/components/${slug}`} className="block px-3 pt-4 pb-2">
        <span className="flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-[-0.015em] text-base-50">{item.name}</span>
          {item.isNew ? (
            <span className="rounded-md bg-signal/10 px-1.5 py-0.5 text-xs font-medium text-signal ring-1 ring-signal/25">New</span>
          ) : (
            <span className="rounded-md px-1.5 py-0.5 text-xs text-base-400 ring-1 ring-base-50/10">{item.category}</span>
          )}
        </span>
        <span className="mt-1.5 line-clamp-2 text-sm leading-6 text-base-400 transition-colors group-hover:text-base-300">{item.description}</span>
      </Link>
    </article>
  );
}
