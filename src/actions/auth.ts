"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, createSessionToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "/");
  const expected = (process.env.APP_PASSWORD ?? "").trim();

  if (!expected || password !== expected) {
    redirect(`/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next.startsWith("/") ? next : "/");
}
