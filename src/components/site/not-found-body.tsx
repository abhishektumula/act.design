import { blocks, registry } from "@/registry/meta";
import { MissingLayer, type SiteNode } from "./missing-layer";

// Only names and links reach the client: not-found ships with every route.
const sections: SiteNode[] = [
  { name: "Home", href: "/" },
  { name: "Components", href: "/components", children: registry.map((r) => ({ name: r.name, href: `/components/${r.slug}` })) },
  { name: "Blocks", href: "/blocks", children: blocks.map((b) => ({ name: b.name, href: `/blocks/${b.slug}` })) },
  { name: "Setup", href: "/setup" },
  { name: "Pricing", href: "/pricing" },
];

/** The site's 404 without chrome; the root not-found adds the navbar, (site) already has it. */
export function NotFoundBody() {
  return (
    <main className="flex-1">
      <MissingLayer sections={sections} />
    </main>
  );
}
