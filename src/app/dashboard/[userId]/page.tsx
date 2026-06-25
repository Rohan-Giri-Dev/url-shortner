"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import SignedUserPanel from "../../components/SignedUserPanel";
import QRCodeDisplay from "../../components/qr/QRCodeDisplay";

type UrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const getAllUrls = useCallback(async () => {
    if (!userId) {
      return [];
    }

    const res = await fetch(`/api/users/${userId}/urls`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to get URLs");
    }

    return data as UrlItem[];
  }, [userId]);

  async function handleCreateUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!userId) {
      setError("Please sign in before creating a saved short URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${userId}/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create short URL");
      }

      setOriginalUrl("");
      const freshUrls = await getAllUrls();
      setUrls(freshUrls);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedUrl(shortUrl);

      window.setTimeout(() => {
        setCopiedUrl(null);
      }, 1800);
    } catch {
      setError("Could not copy the short link. Please copy it manually.");
    }
  }

  useEffect(() => {
    let shouldIgnore = false;

    if (!isLoaded || !userId) {
      return;
    }

    async function loadUrls() {
      try {
        const data = await getAllUrls();

        if (!shouldIgnore) {
          setUrls(data);
          setError("");
        }
      } catch (error) {
        if (error instanceof Error && !shouldIgnore) {
          setError(error.message);
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    void loadUrls();

    return () => {
      shouldIgnore = true;
    };
  }, [getAllUrls, isLoaded, userId]);

  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const latestUrl = urls[0];
  const mostClickedUrl = urls.reduce<UrlItem | null>((bestUrl, currentUrl) => {
    if (!bestUrl || currentUrl.clicks > bestUrl.clicks) {
      return currentUrl;
    }

    return bestUrl;
  }, null);

  function getHostName(value: string) {
    try {
      return new URL(value).hostname.replace(/^www\./, "");
    } catch {
      return "Unknown host";
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a0f] px-4 text-neutral-100">
        <p className="text-sm text-neutral-400">Loading your dashboard...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a0f] px-4 text-neutral-100">
        <div className="rounded-lg border border-white/10 bg-neutral-950 p-6 text-center">
          <p className="text-sm font-medium text-neutral-100">
            Please sign in to view your saved links.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex min-h-10 items-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a0f] px-4 py-6 text-neutral-100 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-lg border border-white/10 bg-neutral-950 px-5 py-5 shadow-2xl shadow-black/20 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
                URL Shortener
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Link command center
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Create short links, copy them quickly, and track what people
                actually click.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 lg:max-w-md">
              <SignedUserPanel />

              {latestUrl && (
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-200">
                    Latest generated link
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href={latestUrl.shortUrl}
                      target="_blank"
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-white hover:text-emerald-100"
                    >
                      {latestUrl.shortUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(latestUrl.shortUrl)}
                      className="min-h-10 rounded-md border border-emerald-300/30 px-4 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/10"
                    >
                      {copiedUrl === latestUrl.shortUrl ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-neutral-400">Total links</p>
              <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
                Saved
              </span>
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">
              {totalLinks}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-neutral-400">Total clicks</p>
              <span className="rounded-md bg-amber-400/10 px-2 py-1 text-xs text-amber-200">
                Traffic
              </span>
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">
              {totalClicks}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-neutral-400">Top link</p>
              <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
                Best
              </span>
            </div>
            <p className="mt-4 truncate text-xl font-semibold text-white">
              {mostClickedUrl ? getHostName(mostClickedUrl.originalUrl) : "-"}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {mostClickedUrl ? `${mostClickedUrl.clicks} clicks` : "No data"}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <aside className="rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-xl shadow-black/10">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">
                Create
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Shorten a new link
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Paste the full destination URL. Your short link will appear in
                the list with a copy button.
              </p>
            </div>

            <form
              onSubmit={handleCreateUrl}
              className="mt-6 flex flex-col gap-4"
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-300">
                  Destination URL
                </span>
                <input
                  value={originalUrl}
                  onChange={(event) => setOriginalUrl(event.target.value)}
                  placeholder="https://example.com/very-long-link"
                  className="min-h-12 rounded-md border border-white/10 bg-[#090d14] px-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !originalUrl.trim() || !userId}
                className="min-h-12 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
              >
                {isSubmitting ? "Shortening..." : "Generate short link"}
              </button>
            </form>

            {error && (
              <p className="mt-5 rounded-md border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
          </aside>

          <section className="overflow-hidden rounded-lg border border-white/10 bg-neutral-950 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Your generated links
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Copy, open, and scan your shortened URLs.
                </p>
              </div>
              <span className="w-fit rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-neutral-300">
                {totalLinks} saved
              </span>
            </div>

            {isLoading ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm text-neutral-400">Loading links...</p>
              </div>
            ) : urls.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-medium text-neutral-200">
                  No short links yet
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  Create your first link from the form on the left.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {urls.map((url) => {
                  const isCopied = copiedUrl === url.shortUrl;

                  return (
                    <article
                      key={url.id}
                      className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.03] xl:grid-cols-[minmax(0,1fr)_160px_112px_100px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-200">
                            {getHostName(url.originalUrl)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            Created {formatDate(url.createdAt)}
                          </span>
                        </div>

                        <p className="mt-3 truncate text-sm text-neutral-400">
                          {url.originalUrl}
                        </p>

                        <div className="mt-3 flex flex-col gap-3 rounded-md border border-white/10 bg-[#090d14] p-3 sm:flex-row sm:items-center">
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            className="min-w-0 flex-1 truncate text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                          >
                            {url.shortUrl}
                          </a>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(url.shortUrl)}
                              className="min-h-10 rounded-md bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                            >
                              {isCopied ? "Copied" : "Copy"}
                            </button>
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              className="flex min-h-10 items-center rounded-md border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.04]"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Short code
                        </p>
                        <p className="mt-2 truncate text-sm font-medium text-neutral-200">
                          {url.shortCode}
                        </p>
                      </div>

                      <div className="flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <QRCodeDisplay url={url.shortUrl} />
                      </div>

                      <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-amber-200/70">
                          Clicks
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-amber-100">
                          {url.clicks}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
