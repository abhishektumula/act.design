import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockView } from "@/components/site/block-view";
import { CodePanel, CodeSkeleton } from "@/components/site/code-panel";
import { CommandLine, DocHeader, PrevNext, Steps } from "@/components/site/doc-parts";
import sources from "@/registry/sources.json";
import { blocks, getBlock, getBlockNeighbours, getItem, installCommand } from "@/registry/meta";

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blocks/[slug]">): Promise<Metadata> {
  const block = getBlock((await params).slug);
  return { title: block ? `${block.name} block · act.design` : "Not found" };
}

const code = "rounded-[4px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-neutral-800 dark:text-neutral-200";

async function BlockPageContent({ params }: Pick<PageProps<"/blocks/[slug]">, "params">) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();

  const { prev, next } = getBlockNeighbours(slug);
  const install = installCommand(block.deps, sources.blocks[slug as keyof typeof sources.blocks]?.code);
  const uses = block.uses.map((s) => getItem(s)).filter((i) => i !== undefined);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 pt-32 pb-24">
      <DocHeader
        crumbs={[
          { href: "/blocks", label: "Blocks" },
          { href: "/blocks", label: block.category },
        ]}
        title={block.name}
        isNew={block.isNew}
        body={block.description}
      />

      <div className="mt-10">
        <BlockView
          slug={slug}
          code={
            <Suspense fallback={<CodeSkeleton />}>
              <CodePanel slug={slug} kind="blocks" />
            </Suspense>
          }
        />
      </div>

      <div className="max-w-3xl">
        <Steps
          steps={[
            <>
              One-time setup: add the <code className={code}>cn</code> helper and class-based dark mode.{" "}
              <Link href="/setup" className="text-neutral-900 dark:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 hover:decoration-neutral-600 dark:hover:decoration-neutral-400">
                See setup
              </Link>
              .
            </>,
            <>
              Install the dependencies.
              <CommandLine value={install} />
            </>,
            ...(uses.length > 0
              ? [
                  <>
                    Add the components this block is built from:
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uses.map((u) => (
                        <Link
                          key={u.slug}
                          href={`/components/${u.slug}`}
                          className="rounded-[4px] bg-neutral-50 dark:bg-neutral-950 px-2.5 py-1 font-mono text-[12px] text-neutral-700 dark:text-neutral-300 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08] transition-colors hover:text-neutral-950 dark:hover:text-neutral-50 hover:ring-neutral-950/20 dark:hover:ring-neutral-50/20"
                        >
                          components/ui/{u.slug}.tsx
                        </Link>
                      ))}
                    </div>
                  </>,
                ]
              : []),
            <>
              Copy the code into <code className={code}>components/blocks/{slug}.tsx</code> and render the named export. All the copy
              lives in that one file, ready to rewrite.
            </>,
          ]}
        />

        <PrevNext
          prev={prev && { href: `/blocks/${prev.slug}`, name: prev.name }}
          next={next && { href: `/blocks/${next.slug}`, name: next.name }}
        />
      </div>
    </main>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
export default function BlockPage({ params }: PageProps<"/blocks/[slug]">) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[1400px] animate-pulse px-6 pt-32 pb-24">
          <div className="h-3 w-40 rounded-[2px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-6 h-10 w-64 rounded-[4px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-5 h-4 w-full max-w-xl rounded-[2px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-12 h-[36rem] rounded-lg bg-neutral-50 dark:bg-neutral-950 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08]" />
        </main>
      }
    >
      <BlockPageContent params={params} />
    </Suspense>
  );
}
