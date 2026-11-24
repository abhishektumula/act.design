"use client";

import { DriftCanvas } from "@/components/ui/drift-canvas";

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1795307026712-1116f5902e4f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A city skyline at dusk under storm clouds" },
  { src: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "Palm fronds framing a lagoon at sunset" },
  { src: "https://images.unsplash.com/photo-1793740687112-e7545e5d5568?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", alt: "A stone breakwater running into a stormy sea" },
];

/** The home page's drifting field of photographs. */
export function HomeDrift() {
  return (
    <DriftCanvas
      items={PHOTOS}
      itemWidth={260}
      itemHeight={330}
      gap={24}
      angle={205}
      speed={26}
      className="mt-12 h-[42rem]"
      renderItem={(p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} draggable={false} loading="lazy" className="size-full rounded-2xl object-cover shadow-[0_24px_48px_-24px_rgb(0_0_0/0.7)] ring-1 ring-base-50/10" />
      )}
    />
  );
}
