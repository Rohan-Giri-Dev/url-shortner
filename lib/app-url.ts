function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getUrlOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function createShortUrl(shortCode: string, requestOrigin: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const requestOriginUrl = getUrlOrigin(requestOrigin);

  if (appUrl) {
    const appOrigin = getUrlOrigin(appUrl);

    if (appOrigin) {
      const appHostname = new URL(appOrigin).hostname;
      const requestHostname = requestOriginUrl
        ? new URL(requestOriginUrl).hostname
        : "";

      if (!isLocalHost(appHostname) || isLocalHost(requestHostname)) {
        return `${appOrigin.replace(/\/$/, "")}/${shortCode}`;
      }
    }
  }

  if (requestOriginUrl) {
    return `${requestOriginUrl.replace(/\/$/, "")}/${shortCode}`;
  }

  if (process.env.VERCEL_URL) {
    const vercelHost = process.env.VERCEL_URL.replace(/^https?:\/\//, "");

    return `https://${vercelHost.replace(/\/$/, "")}/${shortCode}`;
  }

  return `http://localhost:3000/${shortCode}`;
}
