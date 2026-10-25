import { Suspense } from "react";
import type { Metadata } from "next";
import { LogoMark } from "@/components/site/logo";
import { LoginForm } from "@/components/site/login-form";

export const metadata: Metadata = { title: "Sign in · Tasteful UI" };

async function Form({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : "/components"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden px-6 pt-16">
      <div className="absolute top-1/4 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-sm py-24">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-11" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-base-50">Welcome back</h1>
          <p className="mt-2 text-sm text-base-500">Sign in to copy component code.</p>
        </div>
        <div className="mt-10 rounded-2xl bg-base-900/70 p-6 shadow-2xl shadow-shade/60 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 backdrop-blur">
          <Suspense fallback={<div className="h-64" />}>
            <Form searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
