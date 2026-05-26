const BRAWL_STARS_API_BASE = Deno.env.get("BRAWL_STARS_API_BASE") || "https://api.brawlstars.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeTag(tag: string): string {
  const trimmed = tag.trim().toUpperCase();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

async function fetchBrawlStars(path: string, apiKey: string): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${BRAWL_STARS_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("BRAWL_STARS_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "BRAWL_STARS_API_KEY ausente nas Edge Function Secrets." }, 500);
  }

  const body = await req.json().catch(() => ({}));
  const tagParam = typeof body?.tag === "string" ? body.tag : "";
  if (!tagParam.trim()) {
    return jsonResponse({ error: "Parametro tag obrigatorio." }, 400);
  }

  const tag = normalizeTag(tagParam);
  const encodedTag = encodeURIComponent(tag);
  const profile = await fetchBrawlStars(`/players/${encodedTag}`, apiKey);

  if (profile.status >= 400) {
    return jsonResponse(profile.body, profile.status);
  }

  const battlelog = await fetchBrawlStars(`/players/${encodedTag}/battlelog`, apiKey);
  const catalog = await fetchBrawlStars("/brawlers", apiKey);

  return jsonResponse({
    profile: profile.body,
    battlelog: battlelog.status >= 400 ? { items: [] } : battlelog.body,
    catalog: catalog.status >= 400 ? { items: [] } : catalog.body,
  });
});
