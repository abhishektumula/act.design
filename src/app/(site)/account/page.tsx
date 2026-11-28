import { Suspense } from "react";
import type { Metadata } from "next";
import { Highlight } from "@/components/site/fx";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { Crosses, PageHeader, PanelBar } from "@/components/site/frame";
import { MembershipCard } from "@/components/site/membership-card";
import { Preferences } from "@/components/site/preferences";
import { btnSecondary, hairGrid } from "@/components/site/styles";
import { getUser } from "@/lib/session";
import { blocks, registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Account · act.design" };

const perks = [
  "Source for every component",
  "Every block, including AI",
  "New pieces as they ship",
  "Use in unlimited projects",
];

async function AccountDetails() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");

  const stats = [
    ["Plan", user.plan],
    ["Billing", "Paid once"],
    ["Components", `${registry.length}/${registry.length}`],
    ["Blocks", `${blocks.length}/${blocks.length}`],
  ];

  return (
    <>
      <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-end">
        <PageHeader
          title={
            <>
              Hello, <Highlight>{user.firstName}</Highlight>
            </>
          }
          body={user.email}
        >
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/components"
              className={`${btnSecondary} group h-10 rounded-lg px-5 text-sm`}
            >
              Open the components{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <form action={signOut}>
              <button className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </PageHeader>
        <MembershipCard
          name={user.name}
          plan={user.plan}
          since={user.memberSince}
          unlocked={1}
        />
      </div>

      <div className="relative mt-20">
        <Crosses />
        <div className={`${hairGrid} lg:grid-cols-2`}>
          <section className="bg-neutral-50 dark:bg-neutral-950">
            <PanelBar label="Membership">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-blue-600 dark:text-blue-500 uppercase">
                <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_var(--color-blue-600)] dark:shadow-[0_0_8px_var(--color-blue-500)]" />{" "}
                Active
              </span>
            </PanelBar>
            <dl className="grid grid-cols-2 border-b border-neutral-950/[0.06] dark:border-neutral-50/[0.06] sm:grid-cols-4">
              {stats.map(([label, value], i) => (
                <div
                  key={label}
                  className={`p-5 ${i > 0 ? "border-neutral-950/[0.06] dark:border-neutral-50/[0.06] sm:border-l" : ""} ${i % 2 ? "max-sm:border-l" : ""} ${i > 1 ? "max-sm:border-t" : ""}`}
                >
                  <dt className="font-mono text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-2 text-lg font-medium tracking-[-0.02em] text-neutral-950 dark:text-neutral-50 tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="divide-y divide-neutral-950/[0.06] dark:divide-neutral-50/[0.06]">
              {perks.map((perk, i) => (
                <li
                  key={perk}
                  className="flex items-center gap-4 px-5 py-3.5 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-600 tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="flex-1">{perk}</span>
                  <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-neutral-50 dark:bg-neutral-950">
            <PanelBar label="Preferences" />
            <div className="px-5">
              <Preferences />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-24">
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-lg bg-neutral-50 dark:bg-neutral-950" />
        }
      >
        <AccountDetails />
      </Suspense>
    </main>
  );
}
