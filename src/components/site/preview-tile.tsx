import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Preview } from "@/registry/previews";
import { Fit } from "./fit";
import { getItem } from "@/registry/meta";

/** A framed live preview of a registry component. */
export function PreviewTile({ slug, className = "h-80" }: { slug: string; className?: string }) {
  const item = getItem(slug);
  if (!item) return null;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-shadow hover:ring-base-50/15 ${className}`}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
        <Fit>
          <Preview slug={slug} />
        </Fit>
      </div>
      <Link
        href={`/components/${slug}`}
        className="flex items-center justify-between border-t border-base-50/5 bg-base-950 px-4 py-3 text-sm"
      >
        <span className="text-base-300 transition-colors group-hover:text-base-50">{item.name}</span>
        <ArrowUpRight className="size-4 text-base-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-base-300" />
      </Link>
    </div>
  );
}
