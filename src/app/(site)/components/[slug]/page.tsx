import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodePanel, CodeSkeleton } from "@/components/site/code-panel";
import { ComponentView } from "@/components/site/component-view";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  CommandLine,
  PrevNext,
  Steps,
} from "@/components/site/doc-parts";
import { NewMark } from "@/components/site/fx";
import { ProCard } from "@/components/site/pro-card";
import { Values } from "@/components/site/values";
import sources from "@/registry/sources.json";
import {
  getItem,
  getNeighbours,
  installCommand,
  registry,
} from "@/registry/meta";

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug);
  return { title: item ? `${item.name} · act.design` : "Not found" };
}

async function ComponentPageContent({
  params,
}: Pick<PageProps<"/components/[slug]">, "params">) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  const { prev, next } = getNeighbours(slug);
  const index = registry.findIndex((r) => r.slug === slug);
  const exportName = item.name.replace(/\s+/g, "");
  const install = installCommand(
    item.deps,
    sources.components[slug as keyof typeof sources.components]?.code,
  );

  const code =
    "rounded-[4px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-neutral-800 dark:text-neutral-200";

  const prompt = [
    `Add the ${item.name} component from act.design to this project.`,
    `1. Install its dependencies: ${install}`,
    `2. Create components/ui/${slug}.tsx with the source from https://act.design/components/${slug}.`,
    "3. Make sure lib/utils.ts exports the cn helper and globals.css enables class-based dark mode (see https://act.design/setup). Colours are stock Tailwind only.",
    `4. Import { ${exportName} } from "@/components/ui/${slug}" where it is needed. The file's default export is a usage demo.`,
  ].join("\n");
  const arrow =
    "grid size-8 place-items-center rounded-lg text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-950 dark:hover:text-neutral-50";

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { href: "/components", label: "Components" },
              {
                href: `/components#${item.category.toLowerCase().replace(/\s/g, "-")}`,
                label: item.category,
              },
              { href: `/components/${slug}`, label: item.name },
            ]}
          />
          <div className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400 tabular-nums">
            <span className="mr-2">
              {index + 1} / {registry.length}
            </span>
            {prev ? (
              <Link
                href={`/components/${prev.slug}`}
                aria-label={`Previous: ${prev.name}`}
                className={arrow}
              >
                <ArrowLeft className="size-4" />
              </Link>
            ) : (
              <span className={`${arrow} opacity-30`} aria-hidden>
                <ArrowLeft className="size-4" />
              </span>
            )}
            {next ? (
              <Link
                href={`/components/${next.slug}`}
                aria-label={`Next: ${next.name}`}
                className={arrow}
              >
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className={`${arrow} opacity-30`} aria-hidden>
                <ArrowRight className="size-4" />
              </span>
            )}
          </div>
        </div>

        <header className="mt-8 grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-4xl leading-tight font-semibold tracking-[-0.025em] text-neutral-950 dark:text-neutral-50">
            {item.name}
            {item.isNew && <NewMark className="h-6 px-1.5 text-sm" />}
          </h1>
          <p className="text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
            {item.description}
          </p>
        </header>

        <div className="mt-12">
          <ComponentView
            slug={slug}
            prompt={prompt}
            install={install}
            code={
              <Suspense fallback={<CodeSkeleton />}>
                <CodePanel slug={slug} />
              </Suspense>
            }
          />
        </div>

        <Values slug={slug} />

      <Steps
          steps={[
            <>
              One-time setup: add the <code className={code}>cn</code> helper
              and class-based dark mode.{" "}
              <Link
                href="/setup"
                className="text-neutral-900 dark:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 hover:decoration-neutral-600 dark:hover:decoration-neutral-400"
              >
                See setup
              </Link>
              .
            </>,
            <>
              Install the dependencies.
              <CommandLine value={install} />
            </>,
            <>
              Copy the code into{" "}
              <code className={code}>components/ui/{slug}.tsx</code>. Tailwind
              CSS v4 is assumed.
            </>,
            <>
              Import the named export. The default export is the demo shown
              above, handy as a usage example.
            </>,
          ]}
        />

        <PrevNext
          prev={prev && { href: `/components/${prev.slug}`, name: prev.name }}
          next={next && { href: `/components/${next.slug}`, name: next.name }}
        />
      </article>
      <aside className="hidden w-72 shrink-0 xl:block">
        <ProCard />
      </aside>
    </div>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
export default function ComponentPage({
  params,
}: PageProps<"/components/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-3 w-40 rounded-[2px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-6 h-10 w-64 rounded-[4px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-5 h-4 w-full max-w-xl rounded-[2px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06]" />
          <div className="mt-14 h-[30rem] rounded-lg bg-neutral-50 dark:bg-neutral-950 ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08]" />
        </div>
      }
    >
      <ComponentPageContent params={params} />
    </Suspense>
  );
}
