import { Suspense } from "react";
import Link from "next/link";
import { getUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { NavShell } from "./nav-shell";
import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";
import { btnPrimary } from "./styles";

async function NavAccount() {
  const user = await getUser();
  if (user) return <AccountMenu user={user} />;
  return (
    <>
      <Link href="/login" className="px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-950 dark:hover:text-neutral-50">
        Sign in
      </Link>
      <Link href="/pricing" className={`${btnPrimary} h-9 rounded-lg px-4 text-sm max-sm:hidden`}>
        Get All-Access
      </Link>
    </>
  );
}

export function Navbar() {
  return (
    <NavShell>
      <Logo />
      <NavLinks />
      <div className="ml-auto flex items-center gap-3">
        {/* Theme and search share one tray */}
        <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-0.5 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
          <ThemeToggle />
          <SiteSearch />
        </div>
        <span aria-hidden className="hidden h-5 w-px bg-neutral-950/10 dark:bg-neutral-50/10 sm:block" />
        <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />}>
          <NavAccount />
        </Suspense>
      </div>
    </NavShell>
  );
}
