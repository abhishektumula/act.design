import { Suspense } from "react";
import Link from "next/link";
import { getUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";
import { btnGhost, btnPrimary } from "./styles";

async function NavAccount() {
  const user = await getUser();
  if (user) return <AccountMenu user={user} />;
  return (
    <>
      <Link href="/login" className={`${btnGhost} h-8 rounded-md px-3 text-[13px]`}>
        Sign in
      </Link>
      <Link href="/pricing" className={`${btnPrimary} h-8 rounded-md px-3.5 text-[13px] max-sm:hidden`}>
        Get All-Access
      </Link>
    </>
  );
}

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-base-50/[0.06] bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-6">
        <Logo />
        <span className="hidden h-4 w-px bg-base-50/10 md:block" />
        <NavLinks />
        <div className="ml-auto flex items-center gap-2">
          <SiteSearch />
          <ThemeToggle />
          <div className="mx-1 hidden h-4 w-px bg-base-50/10 md:block" />
          <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded-md bg-base-900" />}>
            <NavAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
