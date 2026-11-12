import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { MembershipCard } from "@/components/site/membership-card";
import { Preferences } from "@/components/site/preferences";
import { btnSecondary } from "@/components/site/styles";
import { getUser } from "@/lib/session";
import { blocks, registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Account · act.design" };

const perks = ["Source for every instrument", "Every block, including AI", "New pieces as they ship", "Use in unlimited projects"];

const panel =
  "rounded-[28px] bg-base-950 shadow-[0_1px_0_white_inset,0_30px_60px_-44px_var(--color-shade)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.05)_inset]";

async function AccountDetails() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-base-50 sm:text-6xl">
            Hello, <span className="font-serif font-normal tracking-[-0.02em] italic">{user.firstName}.</span>
          </h1>
          <p className="mt-4 text-base-400">{user.email}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/components" className={`${btnSecondary} group h-11 rounded-2xl px-5 text-sm`}>
              Open the instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <form action={signOut}>
              <button className="flex h-11 items-center gap-2 rounded-2xl px-4 text-sm text-base-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
        <MembershipCard name={user.name} plan={user.plan} since={user.memberSince} />
      </div>

      <div className="mt-16 grid gap-4 lg:grid-cols-2">
        <section className={`${panel} p-2`}>
          <div className="h-full rounded-[22px] p-6 ring-1 ring-base-50/[0.07]">
            <h2 className="text-sm font-medium text-base-100">Membership</h2>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-base-50/[0.07] ring-1 ring-base-50/[0.07]">
              {[
                ["Plan", user.plan],
                ["Billing", "Paid once, lifetime"],
                ["Instruments", `${registry.length} unlocked`],
                ["Blocks", `${blocks.length} unlocked`],
              ].map(([label, value]) => (
                <div key={label} className="bg-base-950 p-4">
                  <dt className="text-xs text-base-500">{label}</dt>
                  <dd className="mt-1.5 text-[15px] font-medium text-base-100">{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-base-300">
                  <span className="grid size-5 place-items-center rounded-full bg-signal/10 text-signal ring-1 ring-signal/25">
                    <Check className="size-3" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${panel} p-2`}>
          <div className="h-full rounded-[22px] px-6 pt-6 pb-1 ring-1 ring-base-50/[0.07]">
            <h2 className="text-sm font-medium text-base-100">Preferences</h2>
            <div className="mt-2">
              <Preferences />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-36 pb-24">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[28px] bg-base-950" />}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}
