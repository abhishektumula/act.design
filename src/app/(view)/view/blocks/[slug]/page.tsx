import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FrameReporter } from "@/components/site/frame-reporter";
import { blockPreviews } from "@/registry/block-previews";
import { blocks, getBlock } from "@/registry/meta";

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/view/blocks/[slug]">): Promise<Metadata> {
  const block = getBlock((await params).slug);
  return { title: block ? `${block.name} · Preview` : "Not found", robots: { index: false } };
}

async function BlockViewContent({ params }: Pick<PageProps<"/view/blocks/[slug]">, "params">) {
  const { slug } = await params;
  const Block = blockPreviews[slug];
  if (!Block) notFound();

  return (
    <FrameReporter id={slug}>
      <Block />
    </FrameReporter>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
/** Bare render of a single block, loaded by the /blocks pages inside an iframe. */
export default function BlockView({ params }: PageProps<"/view/blocks/[slug]">) {
  return (
    <Suspense
      fallback={null}
    >
      <BlockViewContent params={params} />
    </Suspense>
  );
}
