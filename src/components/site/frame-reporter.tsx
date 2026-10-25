"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Inside a block iframe: tells the parent page how tall the block is. */
export function FrameReporter({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;
    const post = () =>
      window.parent.postMessage({ type: "block-height", id, height: el.offsetHeight }, window.location.origin);
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, [id]);

  return <div ref={ref}>{children}</div>;
}
