"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Listens for the height the framed block reports and returns it. */
function useFrameHeight(frame: React.RefObject<HTMLIFrameElement | null>, initial: number) {
  const [height, setHeight] = useState(initial);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "block-height" && typeof e.data.height === "number") setHeight(Math.ceil(e.data.height));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frame]);
  return height;
}

/** A live, auto-height iframe of one block. `width` is the simulated viewport. */
export function BlockFrame({ slug, width, reloadKey }: { slug: string; width: number | "100%"; reloadKey: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const height = useFrameHeight(ref, 560);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex justify-center">
      <div
        className="relative max-w-full overflow-hidden rounded-xl ring-1 ring-base-50/10 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: width === "100%" ? "100%" : `${width}px` }}
      >
        {!loaded && <div className="absolute inset-0 animate-pulse bg-base-950" />}
        <iframe
          key={reloadKey}
          ref={ref}
          src={`/view/blocks/${slug}`}
          title={`${slug} preview`}
          onLoad={() => setLoaded(true)}
          className={cn("block w-full bg-canvas transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
          style={{ height }}
        />
      </div>
    </div>
  );
}

const VIEWPORT = 1280;

/** A scaled-down, non-interactive thumbnail of a block, rendered at desktop width. */
export function BlockThumb({ slug, className }: { slug: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / VIEWPORT));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={cn("relative overflow-hidden bg-canvas", className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-base-950" />}
      {scale > 0 && (
        <iframe
          src={`/view/blocks/${slug}`}
          title={`${slug} thumbnail`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          onLoad={() => setLoaded(true)}
          className="pointer-events-none absolute top-0 left-0 origin-top-left bg-canvas"
          style={{ width: VIEWPORT, height: `${100 / scale}%`, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
