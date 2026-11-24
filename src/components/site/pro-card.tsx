import Link from "next/link";
import { blocks, registry } from "@/registry/meta";
import { BlockThumb } from "./block-frame";
import { btnPrimary } from "./styles";

/** The rail beside a component page: what All-Access opens, and the way in. */
export function ProCard() {
  return (
    <div className="sticky top-24">
      <div data-glow className="rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 p-2 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
        <BlockThumb slug="hero-monitor" className="aspect-[4/3] rounded-xl ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]" />
        <div className="px-3 pt-4 pb-3">
          <p className="text-sm text-neutral-500">act.design Max</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.015em] text-neutral-950 dark:text-neutral-50">Build with everything in Max</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">Source for every component and every block, ready to copy into React and Next.js.</p>
          <Link href="/pricing" className={`${btnPrimary} mt-5 h-10 w-full rounded-lg text-sm`}>
            Get All-Access
          </Link>
        </div>
      </div>
      <p className="mt-4 px-1 text-sm leading-6 text-neutral-500">
        All-Access includes all {registry.length} components and {blocks.length} blocks. Pay once.
      </p>
    </div>
  );
}
