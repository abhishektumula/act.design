import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlockView } from "@/components/site/block-view";
import { CodePanel, CodeSkeleton } from "@/components/site/code-panel";
import { CopyButton } from "@/components/site/kit/copy-button";
import sources from "@/registry/sources.json";
import { blocks, getBlock, getBlockNeighbours, getItem, installCommand } from "@/registry/meta";

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blocks/[slug]">): Promise<Metadata> {
  const block = getBlock((await params).slug);
  return { title: block ? `${block.name} block · Tasteful UI` : "Not found" };
}

const code = "rounded bg-base-900 px-1.5 py-0.5 font-mono text-[13px] text-base-200";

async function BlockPageContent({ params }: Pick<PageProps<"/blocks/[slug]">, "params">) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();

  const { prev, next } = getBlockNeighbours(slug);
  const install = installCommand(block.deps, sources.blocks[slug as keyof typeof sources.blocks]?.code);
  const uses = block.uses.map((s) => getItem(s)).filter((i) => i !== undefined);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 pt-28 pb-24">
      <nav className="flex items-center gap-2 text-sm text-base-500">
        <Link href="/blocks" className="transition-colors hover:text-base-200">
          Blocks
        </Link>
        <span className="text-base-700">/</span>
        <Link href={`/blocks#${block.category.toLowerCase().replace(/\s/g, "-")}`} className="transition-colors hover:text-base-200">
          {block.category}
        </Link>
      </nav>
      <div className="mt-5 flex items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-base-50">{block.name}</h1>
        {block.isNew && (
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-300">
            New
          </span>
        )}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-base-400">{block.description}</p>

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

      <section className="mt-16 max-w-3xl">
        <h2 className="text-lg font-medium text-base-100">Installation</h2>
        <ol className="mt-6 space-y-6 border-l border-base-50/10 pl-6">
          <li>
            <p className="text-sm text-base-400">
              One-time setup: add the <code className={code}>cn</code> helper and theme tokens.{" "}
              <Link href="/setup" className="text-base-100 underline decoration-base-700 underline-offset-4 hover:decoration-base-400">
                See setup
              </Link>
              .
            </p>
          </li>
          <li>
            <p className="text-sm text-base-400">Install the dependencies.</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-base-950 py-1.5 pr-1.5 pl-4 ring-1 ring-base-50/10">
              <code className="flex-1 font-mono text-sm text-base-200">{install}</code>
              <CopyButton value={install} />
            </div>
          </li>
          {uses.length > 0 && (
            <li>
              <p className="text-sm text-base-400">Add the components this block is built from:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {uses.map((u) => (
                  <Link
                    key={u.slug}
                    href={`/components/${u.slug}`}
                    className="rounded-lg bg-base-950 px-3 py-1.5 font-mono text-[13px] text-base-300 ring-1 ring-base-50/10 transition-colors hover:text-base-50 hover:ring-base-50/20"
                  >
                    components/ui/{u.slug}.tsx
                  </Link>
                ))}
              </div>
            </li>
          )}
          <li>
            <p className="text-sm text-base-400">
              Copy the code into <code className={code}>components/blocks/{slug}.tsx</code> and render the named export. Every
              string is a prop with a sensible default.
            </p>
          </li>
        </ol>
      </section>

      <nav className="mt-20 grid max-w-3xl grid-cols-2 gap-4 border-t border-base-50/5 pt-8">
        {prev ? (
          <Link href={`/blocks/${prev.slug}`} className="group rounded-2xl p-4 ring-1 ring-base-50/5 transition-colors hover:bg-base-50/[0.02] hover:ring-base-50/10">
            <span className="flex items-center gap-1.5 text-xs text-base-500">
              <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" /> Previous
            </span>
            <span className="mt-1 block text-sm text-base-200">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/blocks/${next.slug}`}
            className="group rounded-2xl p-4 text-right ring-1 ring-base-50/5 transition-colors hover:bg-base-50/[0.02] hover:ring-base-50/10"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-base-500">
              Next <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-sm text-base-200">{next.name}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
export default function BlockPage({ params }: PageProps<"/blocks/[slug]">) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[1400px] animate-pulse px-6 pt-28 pb-24">
          <div className="h-4 w-40 rounded bg-base-900" />
          <div className="mt-6 h-10 w-64 rounded-lg bg-base-900" />
          <div className="mt-5 h-5 w-full max-w-xl rounded bg-base-900" />
          <div className="mt-12 h-[36rem] rounded-2xl bg-base-950 ring-1 ring-base-50/10" />
        </main>
      }
    >
      <BlockPageContent params={params} />
    </Suspense>
  );
}
