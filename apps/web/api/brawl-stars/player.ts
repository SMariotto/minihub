const BRAWL_STARS_API_BASE = "https://api.brawlstars.com/v1";

interface BrawlPlayerRequest {
  method?: string;
  query: {
    tag?: string | string[];
  };
}

interface BrawlPlayerResponse {
  status(code: number): {
    json(body: unknown): void;
  };
}

function serializeError(err: unknown): { error: string; stack?: string } {
  if (err instanceof Error) {
    return {
      error: err.message,
      stack: err.stack,
    };
  }

  try {
    return { error: JSON.stringify(err) };
  } catch {
    return { error: String(err) };
  }
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

export default async function handler(req: BrawlPlayerRequest, res: BrawlPlayerResponse) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = process.env.BRAWL_STARS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "API Key ausente no servidor" });
      return;
    }

    const tagParam = Array.isArray(req.query.tag) ? req.query.tag[0] : req.query.tag;
    if (!tagParam) {
      res.status(400).json({ error: "Parâmetro tag obrigatório." });
      return;
    }

    const tag = normalizeTag(tagParam);
    const encodedTag = encodeURIComponent(tag);
    const profile = await fetchBrawlStars(`/players/${encodedTag}`, apiKey);

    if (profile.status >= 400) {
      res.status(profile.status).json(profile.body);
      return;
    }

    const battlelog = await fetchBrawlStars(`/players/${encodedTag}/battlelog`, apiKey);
    const battlelogBody = battlelog.status >= 400 ? { items: [] } : battlelog.body;

    res.status(200).json({
      profile: profile.body,
      battlelog: battlelogBody,
    });
  } catch (err: unknown) {
    res.status(500).json({
      ...serializeError(err),
      message: "Falha ao consultar a API do Brawl Stars.",
    });
  }
}
