import express from "express";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BRAWL_STARS_API_BASE = process.env.BRAWL_STARS_API_BASE || "https://api.brawlstars.com/v1";
const BRAWL_STARS_API_KEY = process.env.BRAWL_STARS_API_KEY || "";
const PROXY_SECRET = process.env.PROXY_SECRET || "";

app.disable("x-powered-by");

function mask(value) {
  if (!value) return "<empty>";
  if (value.length <= 10) return `${value.slice(0, 2)}...${value.slice(-2)}`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function normalizeForwardPath(req) {
  const wildcardPath = req.params[0] || "";
  const queryPath = typeof req.query.path === "string" ? req.query.path : "";
  const rawPath = queryPath || wildcardPath;
  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
}

function validateProxySecret(req, res, next) {
  if (!PROXY_SECRET) {
    console.error("[brawl-proxy] PROXY_SECRET is not configured.");
    return res.status(500).json({ error: "Proxy secret not configured." });
  }

  const providedSecret = req.header("X-Proxy-Secret") || "";
  if (providedSecret !== PROXY_SECRET) {
    console.warn("[brawl-proxy] Unauthorized request.", {
      path: req.originalUrl,
      providedSecret: mask(providedSecret),
    });
    return res.status(401).json({ error: "Unauthorized." });
  }

  return next();
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    hasApiKey: Boolean(BRAWL_STARS_API_KEY),
    hasProxySecret: Boolean(PROXY_SECRET),
  });
});

app.get("/v1/*", validateProxySecret, async (req, res) => {
  if (!BRAWL_STARS_API_KEY) {
    console.error("[brawl-proxy] BRAWL_STARS_API_KEY is not configured.");
    return res.status(500).json({ error: "Brawl Stars API key not configured." });
  }

  const forwardPath = normalizeForwardPath(req);
  const upstreamUrl = `${BRAWL_STARS_API_BASE.replace(/\/+$/, "")}${forwardPath}`;

  console.log("[brawl-proxy] Forwarding request.", {
    route: req.originalUrl,
    upstreamUrl,
  });

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BRAWL_STARS_API_KEY}`,
        Accept: "application/json",
      },
    });

    const body = await upstreamResponse.json().catch(() => ({}));

    console.log("[brawl-proxy] Upstream response.", {
      upstreamUrl,
      status: upstreamResponse.status,
      reason: body?.reason,
      message: body?.message,
    });

    return res.status(upstreamResponse.status).json(body);
  } catch (err) {
    console.error("[brawl-proxy] Upstream fetch failed.", {
      upstreamUrl,
      message: err instanceof Error ? err.message : String(err),
    });

    return res.status(502).json({ error: "Failed to reach Brawl Stars API." });
  }
});

app.get("*", (_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("[brawl-proxy] Listening.", {
    port: PORT,
    apiBase: BRAWL_STARS_API_BASE,
    apiKey: mask(BRAWL_STARS_API_KEY),
    hasProxySecret: Boolean(PROXY_SECRET),
  });
});
