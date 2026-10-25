import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ACCOUNT, type Account } from "./account";

export const SESSION_COOKIE = "cl_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createToken(email: string) {
  return `${Buffer.from(email).toString("base64url")}.${sign(email)}`;
}

function verify(token: string): string | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const email = Buffer.from(encoded, "base64url").toString();
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given) ? email : null;
}

/** Reads the session cookie. Must be called inside a <Suspense> boundary. */
export async function getUser(): Promise<Account | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token) === ACCOUNT.email ? ACCOUNT : null;
}
