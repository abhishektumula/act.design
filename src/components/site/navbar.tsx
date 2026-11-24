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
      <Link href="/login" className="px-2 text-sm font-medium text-base-400 transition-colors hover:text-base-50">
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
        <div className="flex items-center gap-0.5 rounded-lg bg-base-900 p-0.5 ring-1 ring-base-50/[0.06]">
          <ThemeToggle />
          <SiteSearch />
        </div>
        <span aria-hidden className="hidden h-5 w-px bg-base-50/10 sm:block" />
        <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-lg bg-base-900" />}>
          <NavAccount />
        </Suspense>
      </div>
    </NavShell>
  );
}
