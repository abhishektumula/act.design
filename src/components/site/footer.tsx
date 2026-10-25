import Link from "next/link";
import { blocks, categories, registry } from "@/registry/meta";
import { LogoMark } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-base-50/5">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-semibold tracking-tight text-base-100">Tasteful UI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-base-500">
            A personal library of calm, interactive React components. Copy, paste, make it yours.
          </p>
        </div>
        {[categories.slice(0, 2), categories.slice(2, 4), categories.slice(4)].map((group, i) => (
          <div key={i} className="space-y-6">
            {group.map((cat) => (
              <div key={cat}>
                <p className="text-xs font-medium text-base-300">{cat}</p>
                <ul className="mt-3 space-y-2">
                  {registry
                    .filter((r) => r.category === cat)
                    .slice(0, 4)
                    .map((r) => (
                      <li key={r.slug}>
                        <Link href={`/components/${r.slug}`} className="text-sm text-base-500 transition-colors hover:text-base-200">
                          {r.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            {i === 2 && (
              <div>
                <p className="text-xs font-medium text-base-300">Blocks</p>
                <ul className="mt-3 space-y-2">
                  {blocks.slice(0, 4).map((b) => (
                    <li key={b.slug}>
                      <Link href={`/blocks/${b.slug}`} className="text-sm text-base-500 transition-colors hover:text-base-200">
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between border-t border-base-50/5 px-6 py-6 text-xs text-base-600">
        <span>Built with Next.js, Tailwind CSS and Motion.</span>
        <span>
          {registry.length} components · {blocks.length} blocks
        </span>
      </div>
    </footer>
  );
}
