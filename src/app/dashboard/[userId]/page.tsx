"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import DashboardExperience from "../../components/DashboardExperience";

export default function UserDashboardPage() {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-4 text-neutral-100">
        <p className="text-sm text-neutral-400">Loading your dashboard...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-4 text-neutral-100">
        <div className="rounded-lg border border-white/10 bg-[#0d1118] p-6 text-center shadow-2xl shadow-black/20">
          <p className="text-sm font-medium text-neutral-100">
            Please sign in to view your saved links.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#042014] transition hover:bg-emerald-300"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <DashboardExperience
      apiPath={`/api/users/${userId}/urls`}
      scopeLabel="Private workspace"
      headline="Manage your saved links with confidence."
      emptyMessage="No saved links yet"
    />
  );
}
