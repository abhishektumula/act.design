import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CodePanel, CodeSkeleton } from "@/components/site/code-panel";
import { ComponentView } from "@/components/site/component-view";
import { CopyButton } from "@/components/site/kit/copy-button";
import sources from "@/registry/sources.json";
import { getItem, getNeighbours, installCommand, registry } from "@/registry/meta";

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug);
  return { title: item ? `${item.name} · Tasteful UI` : "Not found" };
}

async function ComponentPageContent({ params }: Pick<PageProps<"/components/[slug]">, "params">) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  const { prev, next } = getNeighbours(slug);
  const install = installCommand(item.deps, sources.components[slug as keyof typeof sources.components]?.code);

  return (
    <article className="max-w-4xl">
      <nav className="flex items-center gap-2 text-sm text-base-500">
        <Link href="/components" className="transition-colors hover:text-base-200">
          Components
        </Link>
        <span className="text-base-700">/</span>
        <Link
          href={`/components#${item.category.toLowerCase().replace(/\s/g, "-")}`}
          className="transition-colors hover:text-base-200"
        >
          {item.category}
        </Link>
      </nav>

      <div className="mt-5 flex items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-base-50">{item.name}</h1>
        {item.isNew && (
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/20">New</span>
        )}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-base-400">{item.description}</p>

      <div className="mt-12">
        <ComponentView
          slug={slug}
          code={
            <Suspense fallback={<CodeSkeleton />}>
              <CodePanel slug={slug} />
            </Suspense>
          }
        />
      </div>

      <section className="mt-16">
        <h2 className="text-lg font-medium text-base-100">Installation</h2>
        <ol className="mt-6 space-y-6 border-l border-base-50/10 pl-6">
          <li>
              <p className="text-sm text-base-400">
                One-time setup: add the <code className="rounded bg-base-900 px-1.5 py-0.5 font-mono text-[13px] text-base-200">cn</code> helper
                and theme tokens. <Link href="/setup" className="text-base-100 underline decoration-base-700 underline-offset-4 hover:decoration-base-400">See setup</Link>.
              </p>
            </li>
            <li>
              <p className="text-sm text-base-400">Install the dependencies.</p>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-base-950 py-1.5 pr-1.5 pl-4 ring-1 ring-base-50/10">
                <code className="flex-1 font-mono text-sm text-base-200">{install}</code>
                <CopyButton value={install} />
              </div>
            </li>
          <li>
            <p className="text-sm text-base-400">
              Copy the code into <code className="rounded bg-base-900 px-1.5 py-0.5 font-mono text-[13px] text-base-200">components/ui/{slug}.tsx</code>.
              Tailwind CSS v4 is assumed.
            </p>
          </li>
          <li>
            <p className="text-sm text-base-400">
              Import the named export. The default export is the demo shown above, handy as a usage example.
            </p>
          </li>
        </ol>
      </section>

      <nav className="mt-20 grid grid-cols-2 gap-4 border-t border-base-50/5 pt-8">
        {prev ? (
          <Link href={`/components/${prev.slug}`} className="group rounded-2xl p-4 ring-1 ring-base-50/5 transition-colors hover:bg-base-50/[0.02] hover:ring-base-50/10">
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
            href={`/components/${next.slug}`}
            className="group rounded-2xl p-4 text-right ring-1 ring-base-50/5 transition-colors hover:bg-base-50/[0.02] hover:ring-base-50/10"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-base-500">
              Next <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-sm text-base-200">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
export default function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl animate-pulse">
          <div className="h-4 w-40 rounded bg-base-900" />
          <div className="mt-6 h-10 w-64 rounded-lg bg-base-900" />
          <div className="mt-5 h-5 w-full max-w-xl rounded bg-base-900" />
          <div className="mt-14 h-[30rem] rounded-2xl bg-base-950 ring-1 ring-base-50/10" />
        </div>
      }
    >
      <ComponentPageContent params={params} />
    </Suspense>
  );
}
