// The single account this personal library recognises.
export const ACCOUNT = {
  name: "Abhishek Tumula",
  firstName: "Abhishek",
  email: "abhishektumula.in@gmail.com",
  plan: "Max",
  memberSince: "October 2026",
} as const;

export type Account = typeof ACCOUNT;
