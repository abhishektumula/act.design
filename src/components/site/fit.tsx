"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Scales its content down (never up) so tall demos fit inside a tile. */
export function Fit({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const b = box.current;
    const c = content.current;
    if (!b || !c) return;
    // Width comes from the demo root, which may be wider than the tile when it doesn't shrink.
    const update = () => {
      const w =
        (c.firstElementChild as HTMLElement | null)?.offsetWidth ??
        c.offsetWidth;
      setScale(
        Math.min(
          1,
          b.clientHeight / Math.max(1, c.offsetHeight),
          b.clientWidth / Math.max(1, w),
        ),
      );
    };
    const ro = new ResizeObserver(update);
    ro.observe(b);
    ro.observe(c);
    if (c.firstElementChild) ro.observe(c.firstElementChild);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="flex size-full items-center justify-center">
      <div
        ref={content}
        className="flex w-full shrink-0 justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export const Trash = () => {
  return <div className=""></div>;
};
