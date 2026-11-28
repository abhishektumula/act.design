import type { Metadata } from "next";
import { Highlight } from "@/components/site/fx";
import { BlockShelves } from "@/components/site/block-shelves";
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
          body={`${blocks.length} sections, sorted by where they go on a page: heroes, bentos, features, pricing, footers and whole landing pages. Preview any of them at any width, then paste the whole section.`}
        />

        <BlockShelves />
      </main>
      <Footer />
    </>
  );
}
