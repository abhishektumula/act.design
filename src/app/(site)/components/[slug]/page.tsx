import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodePanel, CodeSkeleton } from "@/components/site/code-panel";
import { ComponentView } from "@/components/site/component-view";
import { CommandLine, DocHeader, PrevNext, Steps } from "@/components/site/doc-parts";
import sources from "@/registry/sources.json";
import { getItem, getNeighbours, installCommand, registry } from "@/registry/meta";

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug);
  return { title: item ? `${item.name} · act.design` : "Not found" };
}

async function ComponentPageContent({ params }: Pick<PageProps<"/components/[slug]">, "params">) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  const { prev, next } = getNeighbours(slug);
  const install = installCommand(item.deps, sources.components[slug as keyof typeof sources.components]?.code);

  const code = "rounded-[4px] bg-base-50/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-base-200";

  return (
    <article className="max-w-4xl">
      <DocHeader
        crumbs={[
          { href: "/components", label: "Instruments" },
          { href: `/components#${item.category.toLowerCase().replace(/\s/g, "-")}`, label: item.category },
        ]}
        title={item.name}
        isNew={item.isNew}
        body={item.description}
      />

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

      <Steps
        steps={[
          <>
            One-time setup: add the <code className={code}>cn</code> helper and theme tokens.{" "}
            <Link href="/setup" className="text-base-100 underline decoration-base-700 underline-offset-4 hover:decoration-base-400">
              See setup
            </Link>
            .
          </>,
          <>
            Install the dependencies.
            <CommandLine value={install} />
          </>,
          <>
            Copy the code into <code className={code}>components/ui/{slug}.tsx</code>. Tailwind CSS v4 is assumed.
          </>,
          <>Import the named export. The default export is the demo shown above, handy as a usage example.</>,
        ]}
      />

      <PrevNext
        prev={prev && { href: `/components/${prev.slug}`, name: prev.name }}
        next={next && { href: `/components/${next.slug}`, name: next.name }}
      />
    </article>
  );
}

// params are URL data, so they're read behind Suspense to keep the shared App Shell instant.
export default function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl animate-pulse">
          <div className="h-3 w-40 rounded-[2px] bg-base-50/[0.06]" />
          <div className="mt-6 h-10 w-64 rounded-[4px] bg-base-50/[0.06]" />
          <div className="mt-5 h-4 w-full max-w-xl rounded-[2px] bg-base-50/[0.06]" />
          <div className="mt-14 h-[30rem] rounded-lg bg-base-950 ring-1 ring-base-50/[0.08]" />
        </div>
      }
    >
      <ComponentPageContent params={params} />
    </Suspense>
  );
}
