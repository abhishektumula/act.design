import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { KeyLink } from "@/components/site/key-link";
import { blocks, categories, registry, type Category } from "@/registry/meta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing · act.design" };

type PlanId = "free" | "pro" | "max";

const plans: {
  id: PlanId;
  name: string;
  price: string;
  body: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    body: "Play with every instrument and block, live.",
    features: ["Live previews of everything", "Install instructions", "Command search"],
    cta: "Browse instruments",
    href: "/components",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    body: "Source for the everyday instruments.",
    features: ["Controls, actions, motion, navigation", "Free updates for a year", "Use in client work"],
    cta: "Sign in",
    href: "/login",
  },
  {
    id: "max",
    name: "Max",
    price: "$199",
    body: "Everything, including AI and every block.",
    features: [`All ${registry.length} instruments`, `All ${blocks.length} blocks`, "Lifetime updates", "Unlimited projects"],
    cta: "Go to account",
    href: "/account",
    featured: true,
  },
];

/** Which plans include the source for a category. */
const access: Record<Category | "Blocks", PlanId[]> = {
  Controls: ["pro", "max"],
  Actions: ["pro", "max"],
  Motion: ["pro", "max"],
  Navigation: ["pro", "max"],
  AI: ["max"],
  Blocks: ["max"],
};

function Lamp({ on }: { on: boolean }) {
  return on ? (
    <span className="mx-auto block size-2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" aria-label="Included" />
  ) : (
    <span className="mx-auto block size-2 rounded-full ring-1 ring-base-50/20" aria-label="Preview only" />
  );
}

const panel =
  "bg-base-950 shadow-[0_1px_0_white_inset,0_40px_70px_-50px_color-mix(in_oklab,var(--color-shade)_80%,transparent)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_30px_60px_-30px_black]";

export default function PricingPage() {
  const rows: { group: string; items: { name: string; href: string }[]; plans: PlanId[] }[] = [
    ...categories.map((cat) => ({
      group: cat,
      items: registry.filter((r) => r.category === cat).map((r) => ({ name: r.name, href: `/components/${r.slug}` })),
      plans: access[cat],
    })),
    { group: "Blocks", items: blocks.map((b) => ({ name: b.name, href: `/blocks/${b.slug}` })), plans: access.Blocks },
  ];

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-32">
        <div className="max-w-2xl">
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-7xl">
            Pay once. <span className="font-serif font-normal tracking-[-0.02em] italic">Keep the feel.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-pretty text-base-400">
            No subscription, no seats. Buy the source once and it&apos;s yours, in as many projects as the plan allows.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={cn("relative flex flex-col rounded-[32px] p-2", panel, plan.featured && "ring-signal/40")}>
              <div className="flex flex-1 flex-col rounded-[26px] p-7 ring-1 ring-base-50/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-[15px] font-medium text-base-50">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        plan.featured ? "bg-signal shadow-[0_0_10px_var(--signal)]" : "bg-base-50/15",
                      )}
                    />
                    {plan.name}
                  </span>
                  {plan.featured && (
                    <span className="rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-medium text-signal ring-1 ring-signal/25">
                      Most picked
                    </span>
                  )}
                </div>
                <p className="mt-10 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-[-0.045em] text-base-50">{plan.price}</span>
                  <span className="font-serif text-xl text-base-500 italic">once</span>
                </p>
                <p className="mt-3 text-[15px] text-base-400">{plan.body}</p>
                <ul className="mt-8 flex-1 space-y-3 border-t border-base-50/[0.07] pt-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-base-300">
                      <Check className={cn("size-4 shrink-0", plan.featured ? "text-signal" : "text-base-500")} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <KeyLink href={plan.href} tone={plan.featured ? "signal" : "paper"} className="w-full">
                    {plan.cta} <ArrowRight />
                  </KeyLink>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spec sheet */}
        <section className="mt-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-base-50 sm:text-5xl">
              The <span className="font-serif font-normal tracking-[-0.02em] italic">spec sheet.</span>
            </h2>
            <p className="flex items-center gap-5 text-xs text-base-500">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" /> Source included
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full ring-1 ring-base-50/20" /> Preview only
              </span>
            </p>
          </div>

          <div className={cn("mt-10 overflow-hidden rounded-[28px]", panel)}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-base-50/[0.07]">
                  <th className="px-6 py-5 text-xs font-medium text-base-500 sm:px-8">Instrument</th>
                  {plans.map((p) => (
                    <th key={p.id} className="w-20 py-5 text-center text-[13px] font-medium text-base-100 sm:w-32">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {rows.map((row) => (
                <tbody key={row.group}>
                  <tr className="bg-base-50/[0.025]">
                    <th colSpan={4} className="px-6 py-3 font-serif text-lg font-normal text-base-200 italic sm:px-8">
                      {row.group}
                    </th>
                  </tr>
                  {row.items.map((item) => (
                    <tr key={item.name} className="group border-t border-base-50/[0.05] transition-colors hover:bg-base-50/[0.02]">
                      <td className="px-6 py-3.5 sm:px-8">
                        <Link href={item.href} className="text-base-300 transition-colors group-hover:text-base-50">
                          {item.name}
                        </Link>
                      </td>
                      {plans.map((p) => (
                        <td key={p.id} className="py-3.5">
                          <Lamp on={row.plans.includes(p.id)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
