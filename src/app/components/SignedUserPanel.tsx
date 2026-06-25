"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { SignIn, UserPlus, LinkSimple } from "@phosphor-icons/react";

export default function SignedUserPanel() {
  const { isLoaded, user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "Signed in";

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-neutral-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <span className="text-xs font-medium tracking-wide">Syncing session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/sign-in"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
        >
          <SignIn size={16} weight="bold" />
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#022d1a] transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)] active:scale-[0.98]"
        >
          <UserPlus size={16} weight="bold" />
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-1.5">
        <div className="relative flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-7 w-7 border border-white/10 hover:scale-105 transition-all duration-300",
              },
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Account
          </p>
          <p className="max-w-[140px] truncate text-xs font-semibold text-neutral-200">
            {displayName}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/${user.id}`}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#022d1a] transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)] active:scale-[0.98]"
      >
        <LinkSimple size={16} weight="bold" />
        My links
      </Link>
    </div>
  );
}
