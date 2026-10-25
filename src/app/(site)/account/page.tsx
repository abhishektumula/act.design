import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { MembershipCard } from "@/components/site/membership-card";
import { btnSecondary } from "@/components/site/styles";
import { getUser } from "@/lib/session";
import { registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Account · Tasteful UI" };

const perks = [
  "Source for every component",
  "All AI components",
  "New components as they ship",
  "Use in unlimited projects",
];

async function AccountDetails() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_auto] lg:items-start">
      <div>
        <p className="text-sm text-base-500">Account</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-base-50">{user.name}</h1>
        <p className="mt-2 text-base-400">{user.email}</p>

        <dl className="mt-12 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-2xl bg-base-50/5 ring-1 ring-base-50/10">
          {[
            ["Plan", user.plan],
            ["Member since", user.memberSince],
            ["Components", `${registry.length} unlocked`],
            ["Billing", "Lifetime access"],
          ].map(([label, value]) => (
            <div key={label} className="bg-base-950 p-5">
              <dt className="text-xs text-base-500">{label}</dt>
              <dd className="mt-1.5 text-sm font-medium text-base-100">{value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-10 space-y-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-base-300">
              <span className="grid size-5 place-items-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/25">
                <Check className="size-3" />
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex gap-3">
          <Link href="/components" className={`${btnSecondary} h-10 rounded-xl px-4 text-sm`}>
            Browse components
          </Link>
          <form action={signOut}>
            <button className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </div>

      <MembershipCard name={user.name} plan={user.plan} />
    </div>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-36 pb-24">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-base-950" />}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}
