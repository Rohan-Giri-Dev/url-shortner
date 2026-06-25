"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SignedUserPanel from "./SignedUserPanel";
import QRCodeDisplay from "./qr/QRCodeDisplay";
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ArrowSquareOut, 
  CalendarBlank, 
  QrCode, 
  ChartLine, 
  MagnifyingGlass, 
  Globe, 
  Sparkle,
  HourglassHigh,
  BracketsCurly
} from "@phosphor-icons/react";

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
  icon: Icon,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "emerald" | "amber";
  icon: React.ComponentType<{ size: number; className?: string }>;
}) {
  const toneClass = {
    cyan: "border-cyan-500/10 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.1)]",
    emerald: "border-emerald-500/10 bg-emerald-950/20 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]",
    amber: "border-amber-500/10 bg-amber-950/20 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]",
  }[tone];

  return (
    <div className={`group relative rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.04]`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-4 truncate text-3xl font-semibold tracking-tight text-white group-hover:translate-x-0.5 transition-transform duration-300">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
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
      label: "Forever Link",
      detail: "No Expiry",
      helper: "Link stays active indefinitely",
      className: "border-neutral-500/10 bg-neutral-950/20 text-neutral-400",
    };
  }

  return {
    label: "Expires",
    detail: formatDateTime(value),
    helper: "Auto-deletes after 24 hrs",
    className: "border-amber-500/10 bg-amber-950/20 text-amber-300",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);

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

  const filteredUrls = useMemo(() => {
    if (!searchQuery.trim()) return urls;
    const query = searchQuery.toLowerCase();
    return urls.filter(url => 
      url.originalUrl.toLowerCase().includes(query) ||
      url.shortCode.toLowerCase().includes(query) ||
      getHostName(url.originalUrl).toLowerCase().includes(query)
    );
  }, [urls, searchQuery]);

  return (
    <main className="min-h-screen bg-[#030712] text-neutral-100 flex flex-col antialiased">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#030712]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <LinkIcon size={16} weight="bold" className="text-[#022d1a]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">Snip</span>
              <span className="ml-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[9px] font-semibold text-neutral-400">
                {scopeLabel}
              </span>
            </div>
          </div>
          
          <SignedUserPanel />
        </div>
      </header>

      {/* Main Body */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-10">
          
          {/* Hero Section */}
          <div className="max-w-2xl animate-float-up">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {headline}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Generate crisp short codes, manage links, and track metrics. Simple, safe, and lightning fast.
            </p>
          </div>

          {/* Form and Input Card */}
          <div className="rounded-2xl border border-white/[0.04] bg-[#090d16] p-5 shadow-xl shadow-black/30 animate-float-up [animation-delay:100ms]">
            <form onSubmit={handleCreateUrl} className="flex flex-col gap-3">
              <div className="relative flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-500">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    type="url"
                    required
                    value={originalUrl}
                    onChange={(event) => setOriginalUrl(event.target.value)}
                    placeholder="Enter destination URL (e.g. https://google.com)"
                    className="min-h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/[0.04]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !originalUrl.trim()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-[#022d1a] transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#022d1a] border-t-transparent" />
                      Shortening...
                    </>
                  ) : (
                    "Generate link"
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-medium text-neutral-500">
                <span className="flex items-center gap-1">
                  <HourglassHigh size={12} />
                  Generated links auto-expire in 24 hours.
                </span>
                <span>Please include https:// or http://</span>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/10 bg-red-950/20 px-4 py-3 text-xs font-medium text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {error}
              </div>
            )}
          </div>

          {/* Metrics Bento Grid */}
          <section className="grid gap-4 sm:grid-cols-3 animate-float-up [animation-delay:150ms]">
            <MetricCard label="Total Links" value={totalLinks} tone="cyan" icon={LinkIcon} />
            <MetricCard label="Total Clicks" value={totalClicks} tone="amber" icon={ChartLine} />
            <MetricCard
              label="Top Domain"
              value={mostClickedUrl ? getHostName(mostClickedUrl.originalUrl) : "-"}
              tone="emerald"
              icon={Globe}
            />
          </section>

          {/* Latest Generated Link Area */}
          {latestUrl && (
            <div className="animate-border-glow rounded-2xl border border-emerald-500/20 bg-emerald-950/5 p-5 transition-all animate-float-up [animation-delay:200ms]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
                      <Sparkle size={12} weight="bold" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Latest Short URL
                    </span>
                  </div>
                  <a
                    href={latestUrl.shortUrl}
                    target="_blank"
                    className="mt-2.5 block truncate text-lg font-bold text-white hover:text-emerald-300 transition-colors"
                  >
                    {latestUrl.shortUrl}
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(latestUrl.shortUrl)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-semibold text-[#030712] transition-all hover:bg-neutral-200 active:scale-95"
                  >
                    {copiedUrl === latestUrl.shortUrl ? (
                      <>
                        <Check size={14} weight="bold" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" />
                        Copy
                      </>
                    )}
                  </button>
                  <a
                    href={latestUrl.shortUrl}
                    target="_blank"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 text-xs font-semibold text-neutral-300 transition-all hover:bg-white/[0.06] hover:text-white"
                  >
                    <ArrowSquareOut size={14} />
                    Open
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Links List and Search filters */}
          <section className="flex flex-col gap-4 animate-float-up [animation-delay:250ms]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/[0.04] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Active Links</h2>
                <p className="text-xs text-neutral-500">Scan, filter, and track metrics on your generated shortcuts.</p>
              </div>

              {/* Search filter input */}
              {urls.length > 0 && (
                <div className="relative min-w-[240px]">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <MagnifyingGlass size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search links or hosts..."
                    className="min-h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-8 pr-3 text-xs text-white placeholder:text-neutral-600 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.04]"
                  />
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.04] bg-[#090d16] py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <p className="mt-3.5 text-xs font-medium text-neutral-400">Loading links...</p>
              </div>
            ) : filteredUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02] text-neutral-500">
                  <LinkIcon size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold text-neutral-300">
                  {searchQuery ? "No matches found" : emptyMessage}
                </p>
                <p className="mt-1 text-xs text-neutral-500 max-w-[280px]">
                  {searchQuery ? "Try refining your search text or host name." : "Paste a destination URL above to generate your first link."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredUrls.map((url) => {
                  const expiryInfo = getExpiryInfo(url.expiresAt);
                  const isCopied = copiedUrl === url.shortUrl;
                  const isQrActive = activeQrUrl === url.shortUrl;

                  return (
                    <article
                      key={url.id}
                      className="group flex flex-col md:flex-row justify-between gap-5 rounded-2xl border border-white/[0.04] bg-[#090d16]/50 p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-[#090d16]"
                    >
                      {/* Left: Info area */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/10 bg-cyan-950/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                              <Globe size={10} />
                              {getHostName(url.originalUrl)}
                            </span>
                            <span className="text-[10px] font-medium text-neutral-500">
                              Created {formatDate(url.createdAt)}
                            </span>
                          </div>

                          <a
                            href={url.shortUrl}
                            target="_blank"
                            className="mt-3.5 block text-base font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all truncate"
                          >
                            {url.shortUrl}
                          </a>

                          <p className="mt-1.5 truncate text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                            {url.originalUrl}
                          </p>
                        </div>

                        {/* Actions line */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(url.shortUrl)}
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-white px-3 text-[11px] font-semibold text-[#030712] transition-all hover:bg-neutral-200 active:scale-95"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} weight="bold" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} weight="bold" />
                                Copy
                              </>
                            )}
                          </button>
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-semibold text-neutral-300 transition-all hover:bg-white/[0.06] hover:text-white"
                          >
                            <ArrowSquareOut size={12} />
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveQrUrl(isQrActive ? null : url.shortUrl)}
                            className={`inline-flex min-h-8 items-center gap-1 rounded-lg border px-3 text-[11px] font-semibold transition-all ${
                              isQrActive 
                                ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-400"
                                : "border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.06]"
                            }`}
                          >
                            <QrCode size={12} />
                            {isQrActive ? "Hide QR" : "Show QR"}
                          </button>
                        </div>
                      </div>

                      {/* Right: Stats & QR area */}
                      <div className="flex flex-wrap md:flex-nowrap items-stretch gap-3 md:w-auto">
                        {/* Expiry Pill */}
                        <div className={`flex flex-col justify-center rounded-xl border p-4.5 min-w-[150px] ${expiryInfo.className}`}>
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                            <CalendarBlank size={12} />
                            {expiryInfo.label}
                          </div>
                          <p className="mt-2 text-xs font-bold leading-none">{expiryInfo.detail}</p>
                          <p className="mt-1 text-[9px] opacity-60">{expiryInfo.helper}</p>
                        </div>

                        {/* Clicks & Code Pill */}
                        <div className="grid grid-cols-2 gap-3 min-w-[160px] md:grid-cols-1 md:min-w-[90px]">
                          <div className="flex flex-col justify-center rounded-xl border border-amber-500/10 bg-amber-950/20 p-4.5 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500/60">Clicks</p>
                            <p className="mt-1 text-lg font-black text-amber-300">{url.clicks}</p>
                          </div>
                          <div className="flex flex-col justify-center rounded-xl border border-white/[0.04] bg-white/[0.02] p-4.5 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Code</p>
                            <p className="mt-1 truncate text-xs font-bold text-neutral-300">{url.shortCode}</p>
                          </div>
                        </div>

                        {/* QR Code Canvas panel */}
                        {isQrActive && (
                          <div className="flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 shadow-inner shadow-black/20">
                            <QRCodeDisplay url={url.shortUrl} size={76} />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
