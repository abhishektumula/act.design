import { Suspense } from "react";
import Link from "next/link";
import { getUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";
import { btnGhost, btnPrimary } from "./styles";

const links = [
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks", badge: "New" },
  { href: "/components#ai", label: "AI" },
  { href: "/pricing", label: "Pricing" },
];

async function NavAccount() {
  const user = await getUser();
  if (user) return <AccountMenu user={user} />;
  return (
    <>
      <Link href="/login" className={`${btnGhost} h-9 rounded-xl px-3 text-sm`}>
        Sign in
      </Link>
      <Link href="/pricing" className={`${btnPrimary} hidden h-9 rounded-xl px-4 text-sm sm:inline-flex`}>
        Get All-Access
      </Link>
    </>
  );
}

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-base-50/5 bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-base-400 transition-colors hover:text-base-50"
            >
              {l.label}
              {l.badge && (
                <span className="rounded-md bg-blue-500/15 px-1.5 py-px text-[10px] font-medium text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/25">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SiteSearch />
          <ThemeToggle />
          <div className="mx-1 hidden h-5 w-px bg-base-50/10 md:block" />
          <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-xl bg-base-900" />}>
            <NavAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
