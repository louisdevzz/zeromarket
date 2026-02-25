"use client";

import { signIn, signOut } from "next-auth/react";

interface AuthButtonProps {
  variant?: "signin" | "signout";
  className?: string;
  children?: React.ReactNode;
}

export function SignInButton({ className, children }: Omit<AuthButtonProps, "variant">) {
  return (
    <button
      onClick={() => signIn("github")}
      className={
        className ??
        "flex items-center gap-2.5 rounded-full bg-[#f0f0f0] px-5 py-2 text-sm font-semibold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]"
      }
    >
      {children ?? "Sign in with GitHub"}
    </button>
  );
}

export function SignOutButton({ className, children }: Omit<AuthButtonProps, "variant">) {
  return (
    <button
      onClick={() => signOut()}
      className={
        className ??
        "text-sm text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors"
      }
    >
      {children ?? "Sign out"}
    </button>
  );
}
