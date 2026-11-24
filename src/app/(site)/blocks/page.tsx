import type { Metadata } from "next";
import { Highlight } from "@/components/site/fx";
import { BlockCard } from "@/components/site/block-card";
import { PageHeader } from "@/components/site/frame";
import { Footer } from "@/components/site/footer";
import { blocks } from "@/registry/meta";

export const metadata: Metadata = { title: "Blocks · act.design" };

export default function BlocksIndex() {
  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-6 pt-32 pb-24">
        <PageHeader
          title={
            <>
              Whole sections, <Highlight>assembled</Highlight>
            </>
          }
          body={`${blocks.length} landing sections built from the same instruments, so the controls in them actually work. Preview at any width, then paste the whole section.`}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {blocks.map((b) => (
            <BlockCard key={b.slug} block={b} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
