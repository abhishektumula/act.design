import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/site/login-form";

export const metadata: Metadata = { title: "Sign in · act.design" };

async function Form({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : "/components"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pt-32 pb-24">
      <div className="relative flex w-full justify-center">
        <Suspense fallback={<div className="h-[34rem] w-full max-w-5xl" />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
