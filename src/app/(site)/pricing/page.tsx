import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/frame";
import { btnPrimary, btnSecondary, panel } from "@/components/site/styles";
import { Highlight } from "@/components/site/fx";
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
    body: "Play with every component and block, live.",
    features: ["Live previews of everything", "Install instructions", "Command search"],
    cta: "Browse components",
    href: "/components",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    body: "Source for the everyday components.",
    features: ["Controls, actions, motion, navigation", "Free updates for a year", "Use in client work"],
    cta: "Sign in",
    href: "/login",
  },
  {
    id: "max",
    name: "Max",
    price: "$199",
    body: "Everything, including AI and every block.",
    features: [`All ${registry.length} components`, `All ${blocks.length} blocks`, "Lifetime updates", "Unlimited projects"],
    cta: "Go to account",
    href: "/account",
    featured: true,
  },
];

/** Which plans include the source for a category. */
const access: Record<Category | "Blocks", PlanId[]> = {
  Controls: ["pro", "max"],
  Actions: ["pro", "max"],
  Text: ["pro", "max"],
  Motion: ["pro", "max"],
  AI: ["max"],
  Blocks: ["max"],
};

function Lamp({ on }: { on: boolean }) {
  return on ? (
    <span className="mx-auto block size-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_var(--color-blue-600)] dark:shadow-[0_0_8px_var(--color-blue-500)]" aria-label="Included" />
  ) : (
    <span className="mx-auto block h-px w-3 bg-neutral-950/20 dark:bg-neutral-50/20" aria-label="Preview only" />
  );
}

const TICKS = 30;

/** How much of the library a plan opens, drawn as a lit scale. */
function AccessMeter({ share }: { share: number }) {
  const lit = Math.round(share * TICKS);
  return (
    <div aria-label={`${Math.round(share * 100)}% of the library`}>
      <div className="flex h-6 items-end justify-between">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className={cn("w-[2px] shrink-0 rounded-full", i % 5 === 0 ? "h-full" : "h-3.5", i < lit ? "bg-blue-600 dark:bg-blue-500" : "bg-neutral-950/15 dark:bg-neutral-50/15")}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.12em] text-neutral-500 uppercase">
        <span>Source access</span>
        <span className="text-neutral-800 dark:text-neutral-200 tabular-nums">{Math.round(share * 100)}%</span>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const rows: { group: string; items: { name: string; href: string }[]; plans: PlanId[] }[] = [
    ...categories.map((cat) => ({
      group: cat,
      items: registry.filter((r) => r.category === cat).map((r) => ({ name: r.name, href: `/components/${r.slug}` })),
      plans: access[cat],
    })),
    { group: "Blocks", items: blocks.map((b) => ({ name: b.name, href: `/blocks/${b.slug}` })), plans: access.Blocks },
  ];
  const total = rows.reduce((n, r) => n + r.items.length, 0);
  const share = (id: PlanId) => rows.reduce((n, r) => n + (r.plans.includes(id) ? r.items.length : 0), 0) / total;

  return (
    <>
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-32">
        <PageHeader
          title={
            <>
              Pay once. <Highlight>Keep the feel</Highlight>
            </>
          }
          body="No subscription, no seats. Buy the source once and it's yours, in as many projects as the plan allows."
        />

        {/* Plans */}
        <div className="relative mt-16">
          <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 p-7 sm:p-8",
                  plan.featured ? "ring-1 ring-blue-600/50 dark:ring-blue-500/50" : "ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{plan.name}</span>
                  {plan.featured && (
                    <span className="rounded-md bg-blue-600/10 dark:bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-500 ring-1 ring-blue-600/25 dark:ring-blue-500/25">Most picked</span>
                  )}
                </div>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50 tabular-nums">{plan.price}</span>
                  <span className="text-lg text-neutral-500">once</span>
                </p>
                <p className="mt-3 text-[15px] text-neutral-600 dark:text-neutral-400">{plan.body}</p>
                <div className="mt-8">
                  <AccessMeter share={share(plan.id)} />
                </div>
                <ul className="mt-8 flex-1 divide-y divide-neutral-950/[0.06] dark:divide-neutral-50/[0.06] border-t border-neutral-950/[0.06] dark:border-neutral-50/[0.06]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check className={cn("size-3.5 shrink-0", plan.featured ? "text-blue-600 dark:text-blue-500" : "text-neutral-500")} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={cn(
                    "group mt-8 h-11 w-full rounded-lg text-sm",
                    plan.featured ? btnPrimary : btnSecondary,
                  )}
                >
                  {plan.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Spec sheet */}
        <section className="mt-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                What each plan <Highlight>opens</Highlight>
              </h2>
            </div>
            <p className="flex items-center gap-5 font-mono text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_var(--color-blue-600)] dark:shadow-[0_0_8px_var(--color-blue-500)]" /> Source
              </span>
              <span className="flex items-center gap-2">
                <span className="h-px w-3 bg-neutral-950/20 dark:bg-neutral-50/20" /> Preview only
              </span>
            </p>
          </div>

          <div className={cn("mt-10 overflow-hidden", panel)}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-950/[0.07] dark:border-neutral-50/[0.07]">
                  <th className="px-6 py-4 font-mono text-[10px] font-normal tracking-[0.14em] text-neutral-500 uppercase sm:px-8">Component</th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={cn(
                        "w-20 py-4 text-center font-mono text-[10px] font-normal tracking-[0.14em] uppercase sm:w-32",
                        p.featured ? "text-blue-600 dark:text-blue-500" : "text-neutral-700 dark:text-neutral-300",
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {rows.map((row) => (
                <tbody key={row.group}>
                  <tr className="border-t border-neutral-950/[0.07] dark:border-neutral-50/[0.07] bg-neutral-950/[0.025] dark:bg-neutral-50/[0.025]">
                    <th colSpan={4} className="px-6 py-2.5 font-mono text-[10px] font-normal tracking-[0.16em] text-neutral-600 dark:text-neutral-400 uppercase sm:px-8">
                      {row.group}
                    </th>
                  </tr>
                  {row.items.map((item) => (
                    <tr key={item.name} className="group border-t border-neutral-950/[0.05] dark:border-neutral-50/[0.05] transition-colors hover:bg-neutral-950/[0.02] dark:hover:bg-neutral-50/[0.02]">
                      <td className="px-6 py-3 sm:px-8">
                        <Link href={item.href} className="text-neutral-700 dark:text-neutral-300 transition-colors group-hover:text-neutral-950 dark:group-hover:text-neutral-50">
                          {item.name}
                        </Link>
                      </td>
                      {plans.map((p) => (
                        <td key={p.id} className="py-3">
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
