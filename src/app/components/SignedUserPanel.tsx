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
      <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-[#09090b] px-3 py-1.5 text-neutral-400">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
        <span className="text-[11px] font-medium tracking-wide">Syncing session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/sign-in"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-neutral-800 bg-black px-4 text-xs font-semibold text-neutral-300 transition-all hover:bg-neutral-900 hover:text-white active:scale-[0.98]"
        >
          <SignIn size={14} weight="bold" />
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
        >
          <UserPlus size={14} weight="bold" />
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-[#09090b] px-3 py-1.5">
        <div className="relative flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-6 w-6 border border-neutral-700 hover:scale-105 transition-all duration-300",
              },
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
            Account
          </p>
          <p className="max-w-[120px] truncate text-[11px] font-bold text-neutral-200">
            {displayName}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/${user.id}`}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
      >
        <LinkSimple size={14} weight="bold" />
        My links
      </Link>
    </div>
  );
}
