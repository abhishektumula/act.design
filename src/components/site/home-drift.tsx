"use client";

import { useRef } from "react";
import Link from "next/link";
import { useInView } from "motion/react";
import { DriftCanvas } from "@/components/ui/drift-canvas";
import { Preview } from "@/registry/previews";
import { getItem } from "@/registry/meta";
import { Fit } from "./fit";

/* Light, self-contained demos only: nothing fixed to the viewport, no shaders, no global shortcuts. */
const SHOWN = ["layer-text", "dial", "compare-slider", "card-stack", "fader", "trash-bin", "segmented-control", "stepper", "folder-card", "hold-to-confirm", "code-input"];

/** The home page's drifting canvas of live components. It mounts as it nears the viewport. */
export function HomeDrift() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px 0px" });
  return (
    <div ref={ref} data-glow-live className="mt-12 h-[42rem]">
      {near && (
        <DriftCanvas
          items={SHOWN}
          itemWidth={360}
          itemHeight={300}
          gap={24}
          angle={205}
          speed={24}
          className="h-full"
          renderItem={(slug) => {
            const item = getItem(slug)!;
            return (
              <Link
                href={`/components/${slug}`}
                draggable={false}
                data-glow
                className="group flex size-full cursor-[inherit] flex-col rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/70 p-2 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06] transition-colors hover:ring-neutral-950/20 dark:hover:ring-neutral-50/20"
              >
                <div inert className="pointer-events-none relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white dark:bg-black p-4 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
                  <Fit>
                    <Preview slug={slug} />
                  </Fit>
                </div>
                <span className="flex items-center justify-between px-2 pt-3 pb-1 text-sm">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</span>
                  <span className="text-neutral-500">{item.category}</span>
                </span>
              </Link>
            );
          }}
        />
      )}
    </div>
  );
}
