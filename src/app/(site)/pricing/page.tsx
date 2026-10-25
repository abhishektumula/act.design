import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { btnPrimary, btnSecondary } from "@/components/site/styles";
import { registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Pricing · Tasteful UI" };

const plans = [
  {
    name: "Free",
    price: "$0",
    body: "Browse and play with every component.",
    features: ["Live previews", "Install instructions", "Command search"],
    cta: "Browse components",
    href: "/components",
  },
  {
    name: "Pro",
    price: "$99",
    body: "Source code for the everyday components.",
    features: ["Actions, inputs and navigation", "Overlays and data display", "Free updates for a year"],
    cta: "Sign in",
    href: "/login",
  },
  {
    name: "Max",
    price: "$199",
    body: "Everything, including every AI component.",
    features: [`All ${registry.length} components`, "AI orb, prompt input, streaming text", "Lifetime updates", "Unlimited projects"],
    cta: "Go to account",
    href: "/account",
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-40 pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.035em] text-balance text-base-50">Simple, one-time pricing.</h1>
          <p className="mt-5 text-lg leading-8 text-base-400">Pay once, keep the code forever.</p>
        </div>
        <div className="mt-20 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-8 ring-1 inset-shadow-2xs ${
                plan.featured
                  ? "bg-base-900 shadow-2xl shadow-blue-950/50 ring-blue-500/40 inset-shadow-white/10"
                  : "bg-base-950 ring-base-50/10 inset-shadow-white/5"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-linear-to-b from-blue-500 to-blue-600 px-3 py-1 text-xs font-medium text-white ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30">
                  Your plan
                </span>
              )}
              <p className="text-sm font-medium text-base-300">{plan.name}</p>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-semibold tracking-tight text-base-50">{plan.price}</span>
                <span className="text-sm text-base-500">once</span>
              </p>
              <p className="mt-4 text-sm text-base-400">{plan.body}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-base-300">
                    <Check className={`size-4 ${plan.featured ? "text-blue-600 dark:text-blue-400" : "text-base-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`${plan.featured ? btnPrimary : btnSecondary} mt-10 h-11 rounded-xl text-sm`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
