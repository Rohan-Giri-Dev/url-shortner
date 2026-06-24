"use client";

import { useEffect, useState } from "react";

type UrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getAllUrls() {
    const res = await fetch("/api/urls");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to get URLs");
    }

    return data as UrlItem[];
  }

  async function handleCreateUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ originalUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create short URL");
      setIsSubmitting(false);
      return;
    }

    setOriginalUrl("");
    const freshUrls = await getAllUrls();
    setUrls(freshUrls);
    setIsSubmitting(false);
  }

  useEffect(() => {
    let shouldIgnore = false;

    async function loadUrls() {
      try {
        const data = await getAllUrls();

        if (!shouldIgnore) {
          setUrls(data);
        }
      } catch (error) {
        if (error instanceof Error && !shouldIgnore) {
          setError(error.message);
        }
      }
    }

    void loadUrls();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const latestUrl = urls[0];

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">
              URL Shortener
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Dashboard
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-neutral-400">
            Create short links, watch clicks, and keep your saved URLs in one
            quiet workspace.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Total links</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {totalLinks}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Total clicks</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {totalClicks}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Latest short code</p>
            <p className="mt-3 truncate text-3xl font-semibold text-white">
              {latestUrl ? latestUrl.shortCode : "-"}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white">
              Create short URL
            </h2>
            <p className="text-sm text-neutral-400">
              Paste a full URL including https://
            </p>
          </div>

          <form
            onSubmit={handleCreateUrl}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              placeholder="https://example.com/very-long-link"
              className="min-h-11 flex-1 rounded-md border border-white/10 bg-neutral-950 px-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
            <button
              type="submit"
              disabled={isSubmitting || !originalUrl.trim()}
              className="min-h-11 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {isSubmitting ? "Shortening..." : "Shorten URL"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-md border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Your links</h2>
            <span className="rounded-md border border-white/10 px-3 py-1 text-xs font-medium text-neutral-400">
              {totalLinks} saved
            </span>
          </div>

          {urls.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-neutral-400">
                No short links created yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {urls.map((url) => {
                const shortUrl = `/${url.shortCode}`;
                const createdAt = new Date(url.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <article
                    key={url.id}
                    className="grid gap-4 px-5 py-4 transition hover:bg-white/[0.03] lg:grid-cols-[1fr_180px_110px_120px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {url.originalUrl}
                      </p>
                      <a
                        href={shortUrl}
                        target="_blank"
                        className="mt-1 block text-sm text-emerald-300 hover:text-emerald-200"
                      >
                        {shortUrl}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Short code
                      </p>
                      <p className="mt-1 truncate text-sm text-neutral-200">
                        {url.shortCode}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Clicks
                      </p>
                      <p className="mt-1 text-sm font-medium text-amber-200">
                        {url.clicks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Created
                      </p>
                      <p className="mt-1 text-sm text-neutral-300">
                        {createdAt}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
