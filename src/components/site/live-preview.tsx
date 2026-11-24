"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { Preview } from "@/registry/previews";
import { Fit } from "./fit";

/** A tile's live demo, mounted once the tile scrolls near the viewport, so it plays where it is seen. */
export function LivePreview({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <div ref={ref} className="flex size-full items-center justify-center">
      {seen && (
        <Fit>
          <Preview slug={slug} />
        </Fit>
      )}
    </div>
  );
}
