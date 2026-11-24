"use client";

import Link from "next/link";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { Preview } from "@/registry/previews";
import { getItem } from "@/registry/meta";
import { Fit } from "./fit";

/* Light, self-contained demos only: nothing fixed to the viewport, no shaders, no global shortcuts. */
const SHOWN = [
  "layer-text",
  "dial",
  "compare-slider",
  "card-stack",
  "fader",
  "trash-bin",
  "segmented-control",
  "stepper",
  "folder-card",
  "hold-to-confirm",
  "code-input",
];

/** The whole library laid out on one endless canvas, every tile a live component. */
export function Playground() {
  return (
    // `contents` keeps the canvas sized by our parent; the wrapper only marks it as moving.
    <div data-glow-live className="contents">
      <InfiniteGrid
        items={SHOWN}
        wheel={false}
        cellWidth={340}
        cellHeight={300}
        gap={20}
        aria-label="Every component on one canvas. Drag to move around, or use the arrow keys."
        className="h-full"
        renderItem={(slug) => {
          const item = getItem(slug)!;
          return (
            <Link
              href={`/components/${slug}`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              data-glow
              className="group flex size-full flex-col rounded-2xl bg-base-900/70 p-2 ring-1 ring-base-50/[0.06] transition-colors hover:ring-base-50/15"
            >
              <div
                inert
                className="pointer-events-none relative min-h-0 flex-1 overflow-hidden rounded-xl bg-canvas p-4 ring-1 ring-base-50/[0.06]"
              >
                <Fit>
                  <Preview slug={slug} />
                </Fit>
              </div>
              <span className="flex items-center justify-between px-2 pt-3 pb-1 text-sm">
                <span className="font-medium text-base-100">{item.name}</span>
                <span className="text-base-500">{item.category}</span>
              </span>
            </Link>
          );
        }}
      />
    </div>
  );
}
