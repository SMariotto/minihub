const BRAWL_STARS_API_BASE = Deno.env.get("BRAWL_STARS_API_BASE") || "https://api.brawlstars.com/v1";
const BRAWL_STARS_PROXY_URL = Deno.env.get("BRAWL_STARS_PROXY_URL") || "";
const BRAWL_STARS_PROXY_SECRET = Deno.env.get("BRAWL_STARS_PROXY_SECRET") || "";
const REQUEST_TIMEOUT_MS = Number(Deno.env.get("BRAWL_STARS_TIMEOUT_MS") || 12000);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type JsonBody = Record<string, unknown>;

interface BrawlFetchResult {
  status: number;
  body: unknown;
  url: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function maskSecret(value: string): string {
  if (!value) return "<empty>";
  if (value.length <= 10) return `${value.slice(0, 2)}...${value.slice(-2)}`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function normalizeTag(tag: string): string {
  const normalized = tag.trim().toUpperCase();
  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

function validateTag(tag: string): string | null {
  const withoutHash = tag.replace(/^#/, "");
  if (!withoutHash) return "Parametro tag obrigatorio.";
  if (!/^[0289PYLQGRJCUV]+$/i.test(withoutHash)) {
    return "Tag contem caracteres invalidos para uma tag de jogador do Brawl Stars.";
  }
  return null;
}

function buildUpstreamUrl(path: string): string {
  const proxyUrl = BRAWL_STARS_PROXY_URL.trim();
  if (!proxyUrl) {
    return `${BRAWL_STARS_API_BASE.replace(/\/+$/, "")}${path}`;
  }

  if (proxyUrl.includes("{path}")) {
    return proxyUrl.replace("{path}", encodeURIComponent(path));
  }

  return `${proxyUrl.replace(/\/+$/, "")}${path}`;
}

function buildUpstreamHeaders(apiKey: string): Headers {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  });

  if (BRAWL_STARS_PROXY_URL.trim() && BRAWL_STARS_PROXY_SECRET) {
    headers.set("X-Proxy-Secret", BRAWL_STARS_PROXY_SECRET);
  }

  return headers;
}

function maskedHeaders(headers: Headers): Record<string, string> {
  const output: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    const lowerKey = key.toLowerCase();
    output[key] = lowerKey === "authorization" || lowerKey.includes("secret")
      ? maskSecret(value)
      : value;
  }

  return output;
}

async function fetchBrawlStars(path: string, apiKey: string, requestId: string): Promise<BrawlFetchResult> {
  const url = buildUpstreamUrl(path);
  const headers = buildUpstreamHeaders(apiKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  console.log(`[brawl-stars-player][${requestId}] upstream request`, {
    path,
    url,
    usingProxy: Boolean(BRAWL_STARS_PROXY_URL.trim()),
    headers: maskedHeaders(headers),
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));

    console.log(`[brawl-stars-player][${requestId}] upstream response`, {
      path,
      status: response.status,
      reason: typeof body === "object" && body ? (body as JsonBody).reason : undefined,
      message: typeof body === "object" && body ? (body as JsonBody).message : undefined,
    });

    return { status: response.status, body, url };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log(`[brawl-stars-player][${requestId}] incoming request`, {
    method: req.method,
    url: req.url,
    hasAuthorizationHeader: req.headers.has("authorization"),
  });

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed", requestId }, 405);
    }

    const apiKey = Deno.env.get("BRAWL_STARS_API_KEY");
    if (!apiKey) {
      console.error(`[brawl-stars-player][${requestId}] missing BRAWL_STARS_API_KEY`);
      return jsonResponse({ error: "BRAWL_STARS_API_KEY ausente nas Edge Function Secrets.", requestId }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const tagParam = typeof body?.tag === "string" ? body.tag : "";
    const tag = normalizeTag(tagParam);
    const tagError = validateTag(tag);

    if (tagError) {
      console.error(`[brawl-stars-player][${requestId}] invalid tag`, { tag: tagParam, reason: tagError });
      return jsonResponse({ error: tagError, requestId }, 400);
    }

    const encodedTag = encodeURIComponent(tag);
    console.log(`[brawl-stars-player][${requestId}] normalized tag`, {
      tag,
      encodedTag,
      apiKey: maskSecret(apiKey),
      usingProxy: Boolean(BRAWL_STARS_PROXY_URL.trim()),
      proxyUrl: BRAWL_STARS_PROXY_URL.trim() || null,
    });

    const profile = await fetchBrawlStars(`/players/${encodedTag}`, apiKey, requestId);

    if (profile.status >= 400) {
      console.error(`[brawl-stars-player][${requestId}] profile fetch failed`, {
        status: profile.status,
        url: profile.url,
        body: profile.body,
      });

      return jsonResponse({
        error: "Falha ao consultar perfil na API do Brawl Stars.",
        upstreamStatus: profile.status,
        upstreamBody: profile.body,
        requestId,
      }, profile.status);
    }

    const [battlelog, catalog] = await Promise.all([
      fetchBrawlStars(`/players/${encodedTag}/battlelog`, apiKey, requestId),
      fetchBrawlStars("/brawlers", apiKey, requestId),
    ]);

    return jsonResponse({
      profile: profile.body,
      battlelog: battlelog.status >= 400 ? { items: [] } : battlelog.body,
      catalog: catalog.status >= 400 ? { items: [] } : catalog.body,
      meta: {
        requestId,
        source: BRAWL_STARS_PROXY_URL.trim() ? "proxy" : "direct",
        battlelogStatus: battlelog.status,
        catalogStatus: catalog.status,
      },
    });
  } catch (err) {
    const message = safeErrorMessage(err);
    console.error(`[brawl-stars-player][${requestId}] unhandled error`, { message, err });

    return jsonResponse({
      error: "Erro inesperado na Edge Function brawl-stars-player.",
      message,
      requestId,
    }, 500);
  }
});
