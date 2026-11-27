import type { Metadata } from "next";
import { GlowField } from "@/components/site/glow-field";
import { Navbar } from "@/components/site/navbar";
import { NotFoundBody } from "@/components/site/not-found-body";

export const metadata: Metadata = { title: "Not found · act.design" };

/** Unmatched URLs land here, outside the (site) layout, so this brings its own navbar. */
export default function RootNotFound() {
  return (
    <>
      <GlowField />
      <Navbar />
      <NotFoundBody />
    </>
  );
}
