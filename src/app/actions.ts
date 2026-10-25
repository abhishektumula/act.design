"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT } from "@/lib/account";
import { SESSION_COOKIE, createToken } from "@/lib/session";

const PASSWORD = process.env.ACCOUNT_PASSWORD ?? "maxplan";

export async function signIn(_: { error?: string } | undefined, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/components");

  if (email !== ACCOUNT.email || password !== PASSWORD) {
    return { error: "That email and password don't match." };
  }

  (await cookies()).set(SESSION_COOKIE, createToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/components");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
