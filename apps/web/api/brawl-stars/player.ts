const BRAWL_STARS_API_BASE = "https://api.brawlstars.com/v1";

function normalizeTag(tag: string): string {
  const trimmed = tag.trim().toUpperCase();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

async function fetchBrawlStars(path: string) {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    return {
      status: 500,
      body: { error: "BRAWL_STARS_API_KEY não configurada no ambiente." },
    };
  }

  const response = await fetch(`${BRAWL_STARS_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tagParam = Array.isArray(req.query.tag) ? req.query.tag[0] : req.query.tag;
  if (!tagParam) {
    res.status(400).json({ error: "Parâmetro tag obrigatório." });
    return;
  }

  const tag = normalizeTag(tagParam);
  const encodedTag = encodeURIComponent(tag);
  const profile = await fetchBrawlStars(`/players/${encodedTag}`);

  if (profile.status >= 400) {
    res.status(profile.status).json(profile.body);
    return;
  }

  const battlelog = await fetchBrawlStars(`/players/${encodedTag}/battlelog`);
  const battlelogBody = battlelog.status >= 400 ? { items: [] } : battlelog.body;

  res.status(200).json({
    profile: profile.body,
    battlelog: battlelogBody,
  });
}
