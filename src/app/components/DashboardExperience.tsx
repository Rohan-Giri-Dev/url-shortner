"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SignedUserPanel from "./SignedUserPanel";
import QRCodeDisplay from "./qr/QRCodeDisplay";

type UrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
};

type DashboardExperienceProps = {
  apiPath: string;
  scopeLabel: string;
  headline: string;
  emptyMessage: string;
};

type ExpiryInfo = {
  label: string;
  detail: string;
  helper: string;
  className: string;
};

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "amber" | "emerald";
}) {
  const toneClass = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1118] p-4 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">{label}</p>
        <span className={`rounded-md border px-2 py-1 text-xs ${toneClass}`}>
          Live
        </span>
      </div>
      <p className="mt-4 truncate text-3xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getHostName(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown host";
  }
}

function getExpiryInfo(value: string | null): ExpiryInfo {
  if (!value) {
    return {
      label: "No expiry set",
      detail: "Legacy link",
      helper: "Stays active",
      className: "border-neutral-700 bg-white/[0.03] text-neutral-200",
    };
  }

  return {
    label: "Expires at",
    detail: formatDateTime(value),
    helper: "Auto-deletes after expiry",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  };
}

export default function DashboardExperience({
  apiPath,
  scopeLabel,
  headline,
  emptyMessage,
}: DashboardExperienceProps) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const getAllUrls = useCallback(async () => {
    const res = await fetch(apiPath);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to get URLs");
    }

    return data as UrlItem[];
  }, [apiPath]);

  async function handleCreateUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(apiPath, {
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
  }, [getAllUrls]);

  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const latestUrl = urls[0];
  const mostClickedUrl = useMemo(
    () =>
      urls.reduce<UrlItem | null>((bestUrl, currentUrl) => {
        if (!bestUrl || currentUrl.clicks > bestUrl.clicks) {
          return currentUrl;
        }

        return bestUrl;
      }, null),
    [urls]
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090d] px-4 py-5 text-neutral-100 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5">
        <header className="min-w-0 rounded-lg border border-white/10 bg-[#0d1118] px-4 py-4 shadow-2xl shadow-black/20 sm:px-6">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
                  URL Shortener
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-neutral-300">
                  {scopeLabel}
                </span>
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                {headline}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                Create clean short links, copy them in one move, and see the
                details that matter before you share.
              </p>
            </div>

            <SignedUserPanel />
          </div>

          <form
            onSubmit={handleCreateUrl}
            className="mt-6 min-w-0 rounded-lg border border-white/10 bg-[#080b11] p-3 sm:p-4"
          >
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <label className="min-w-0">
                <span className="sr-only">Destination URL</span>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(event) => setOriginalUrl(event.target.value)}
                  placeholder="Paste a destination URL"
                  className="min-h-12 w-full rounded-md border border-white/10 bg-[#0d1118] px-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !originalUrl.trim()}
                className="min-h-12 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-[#042014] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-[#738079]"
              >
                {isSubmitting ? "Shortening..." : "Generate link"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <span>New links expire after 24 hours.</span>
              <span className="break-words">
                Use the full URL including https://
              </span>
            </div>
          </form>

          {error && (
            <p className="mt-4 rounded-md border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Total links" value={totalLinks} tone="cyan" />
          <MetricCard label="Total clicks" value={totalClicks} tone="amber" />
          <MetricCard
            label="Top destination"
            value={mostClickedUrl ? getHostName(mostClickedUrl.originalUrl) : "-"}
            tone="emerald"
          />
        </section>

        {latestUrl && (
          <section className="min-w-0 rounded-lg border border-emerald-400/20 bg-[#0d1512] px-4 py-4 sm:px-5">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-200">
                  Latest generated link
                </p>
                <a
                  href={latestUrl.shortUrl}
                  target="_blank"
                  className="mt-2 block truncate text-base font-semibold text-white hover:text-emerald-100"
                >
                  {latestUrl.shortUrl}
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(latestUrl.shortUrl)}
                  className="min-h-10 rounded-md bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                >
                  {copiedUrl === latestUrl.shortUrl ? "Copied" : "Copy"}
                </button>
                <a
                  href={latestUrl.shortUrl}
                  target="_blank"
                  className="inline-flex min-h-10 items-center rounded-md border border-emerald-300/30 px-4 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/10"
                >
                  Open
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Links</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Scan destinations, expiry, QR codes, and click counts at a glance.
              </p>
            </div>
            <span className="w-fit rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-neutral-300">
              {totalLinks} active
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-white/10 bg-[#0d1118] px-5 py-14 text-center">
              <p className="text-sm text-neutral-400">Loading links...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-[#0d1118] px-5 py-14 text-center">
              <p className="text-sm font-medium text-neutral-200">
                {emptyMessage}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Paste a destination URL above to create the first active link.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {urls.map((url) => {
                const expiryInfo = getExpiryInfo(url.expiresAt);
                const isCopied = copiedUrl === url.shortUrl;

                return (
                  <article
                    key={url.id}
                    className="grid min-w-0 gap-4 rounded-lg border border-white/10 bg-[#0d1118] p-4 shadow-xl shadow-black/10 transition hover:border-white/20 lg:grid-cols-[minmax(0,1fr)_180px_108px_112px]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-200">
                          {getHostName(url.originalUrl)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Created {formatDate(url.createdAt)}
                        </span>
                      </div>

                        <p className="mt-3 break-words text-sm text-neutral-400">
                          {url.originalUrl}
                        </p>

                        <div className="mt-3 flex min-w-0 flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
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
                            className="inline-flex min-h-10 items-center rounded-md border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.04]"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`self-start rounded-md border px-3 py-3 ${expiryInfo.className}`}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                        {expiryInfo.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-5">
                        {expiryInfo.detail}
                      </p>
                      <p className="mt-2 text-xs opacity-75">
                        {expiryInfo.helper}
                      </p>
                    </div>

                    <div className="flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] p-3">
                      <QRCodeDisplay url={url.shortUrl} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                      <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-amber-200/70">
                          Clicks
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-amber-100">
                          {url.clicks}
                        </p>
                      </div>
                      <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Code
                        </p>
                        <p className="mt-2 truncate text-sm font-semibold text-neutral-200">
                          {url.shortCode}
                        </p>
                      </div>
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
