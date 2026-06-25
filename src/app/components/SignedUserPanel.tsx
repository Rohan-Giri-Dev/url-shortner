"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SignedUserPanel() {
  const { isLoaded, user } = useUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "Signed in";

  if (!isLoaded) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="text-sm text-neutral-400">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/sign-in"
          className="inline-flex min-h-10 items-center rounded-md border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.04]"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex min-h-10 items-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <UserButton />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Signed in as
          </p>
          <p className="max-w-48 truncate text-sm font-semibold text-white">
            {displayName}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/${user.id}`}
        className="inline-flex min-h-10 items-center rounded-md border border-emerald-300/30 px-4 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/10"
      >
        My links
      </Link>
    </div>
  );
}
