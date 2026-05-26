create schema if not exists extensions;
create schema if not exists vault;

create extension if not exists http with schema extensions;
create extension if not exists supabase_vault with schema vault;

create or replace function public.buscar_brawl_stars(player_tag text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, vault, pg_temp
as $$
declare
  api_key text;
  api_base text := 'https://api.brawlstars.com/v1';
  normalized_tag text;
  encoded_tag text;
  profile_status integer;
  profile_body jsonb;
  battlelog_status integer;
  battlelog_body jsonb := '{"items":[]}'::jsonb;
  catalog_status integer;
  catalog_body jsonb := '{"items":[]}'::jsonb;
  brawlers jsonb;
  catalog_brawlers jsonb;
  battle_items jsonb;
begin
  normalized_tag := upper(trim(player_tag));
  if normalized_tag = '' then
    return jsonb_build_object('reason', 'missingTag', 'message', 'Tag do jogador obrigatoria.');
  end if;

  if left(normalized_tag, 1) <> '#' then
    normalized_tag := '#' || normalized_tag;
  end if;

  select decrypted_secret
    into api_key
    from vault.decrypted_secrets
    where name = 'BRAWL_STARS_API_KEY'
    limit 1;

  api_key := coalesce(nullif(api_key, ''), nullif(current_setting('app.brawl_stars_api_key', true), ''));

  if api_key is null then
    return jsonb_build_object(
      'reason', 'missingApiKey',
      'message', 'BRAWL_STARS_API_KEY ausente no Supabase Vault.'
    );
  end if;

  encoded_tag := replace(normalized_tag, '#', '%23');

  select status, content::jsonb
    into profile_status, profile_body
    from extensions.http((
      'GET',
      api_base || '/players/' || encoded_tag,
      array[
        extensions.http_header('Authorization', 'Bearer ' || api_key),
        extensions.http_header('Accept', 'application/json')
      ],
      null,
      null
    )::extensions.http_request);

  if profile_status = 404 then
    return jsonb_build_object('reason', 'notFound', 'message', 'Tag invalida. Use a tag real de jogador.');
  end if;

  if profile_status >= 400 then
    return jsonb_build_object(
      'reason', 'brawlApiError',
      'message', coalesce(profile_body->>'message', profile_body->>'reason', 'Falha ao consultar jogador na API oficial.'),
      'status', profile_status
    );
  end if;

  select status, content::jsonb
    into battlelog_status, battlelog_body
    from extensions.http((
      'GET',
      api_base || '/players/' || encoded_tag || '/battlelog',
      array[
        extensions.http_header('Authorization', 'Bearer ' || api_key),
        extensions.http_header('Accept', 'application/json')
      ],
      null,
      null
    )::extensions.http_request);

  if battlelog_status >= 400 or jsonb_typeof(battlelog_body->'items') <> 'array' then
    battlelog_body := '{"items":[]}'::jsonb;
  end if;

  select status, content::jsonb
    into catalog_status, catalog_body
    from extensions.http((
      'GET',
      api_base || '/brawlers',
      array[
        extensions.http_header('Authorization', 'Bearer ' || api_key),
        extensions.http_header('Accept', 'application/json')
      ],
      null,
      null
    )::extensions.http_request);

  if catalog_status >= 400 or jsonb_typeof(catalog_body->'items') <> 'array' then
    catalog_body := '{"items":[]}'::jsonb;
  end if;

  brawlers := case
    when jsonb_typeof(profile_body->'brawlers') = 'array' then profile_body->'brawlers'
    else '[]'::jsonb
  end;

  catalog_brawlers := case
    when jsonb_typeof(catalog_body->'items') = 'array' then catalog_body->'items'
    else '[]'::jsonb
  end;

  battle_items := case
    when jsonb_typeof(battlelog_body->'items') = 'array' then battlelog_body->'items'
    else '[]'::jsonb
  end;

  return jsonb_build_object(
    'name', coalesce(profile_body->>'name', ''),
    'tag', coalesce(profile_body->>'tag', normalized_tag),
    'trophies', coalesce((profile_body->>'trophies')::integer, 0),
    'expLevel', coalesce((profile_body->>'expLevel')::integer, 0),
    'brawlersUnlocked', jsonb_array_length(brawlers),
    'totalBrawlers', greatest(jsonb_array_length(brawlers), jsonb_array_length(catalog_brawlers), 1),
    'powerLevelTotal', coalesce((
      select sum(coalesce((brawler->>'power')::integer, 0))
      from jsonb_array_elements(brawlers) as brawler
    ), 0),
    'maxPowerLevelTotal', greatest(jsonb_array_length(brawlers), jsonb_array_length(catalog_brawlers), 1) * 11,
    'gadgetsOwned', coalesce((
      select sum(case when jsonb_typeof(brawler->'gadgets') = 'array' then jsonb_array_length(brawler->'gadgets') else 0 end)
      from jsonb_array_elements(brawlers) as brawler
    ), 0),
    'maxGadgets', greatest(coalesce((
      select sum(case when jsonb_typeof(brawler->'gadgets') = 'array' then jsonb_array_length(brawler->'gadgets') else 0 end)
      from jsonb_array_elements(catalog_brawlers) as brawler
    ), 0), greatest(jsonb_array_length(brawlers), jsonb_array_length(catalog_brawlers), 1) * 2, 1),
    'starPowersOwned', coalesce((
      select sum(case when jsonb_typeof(brawler->'starPowers') = 'array' then jsonb_array_length(brawler->'starPowers') else 0 end)
      from jsonb_array_elements(brawlers) as brawler
    ), 0),
    'maxStarPowers', greatest(coalesce((
      select sum(case when jsonb_typeof(brawler->'starPowers') = 'array' then jsonb_array_length(brawler->'starPowers') else 0 end)
      from jsonb_array_elements(catalog_brawlers) as brawler
    ), 0), greatest(jsonb_array_length(brawlers), jsonb_array_length(catalog_brawlers), 1) * 2, 1),
    'totalVictories',
      coalesce((profile_body->>'3vs3Victories')::integer, 0)
      + coalesce((profile_body->>'soloVictories')::integer, 0)
      + coalesce((profile_body->>'duoVictories')::integer, 0),
    'battlelog', coalesce((
      select jsonb_agg(jsonb_build_object(
        'battleTime', coalesce(item->>'battleTime', now()::text),
        'result', case item #>> '{battle,result}'
          when 'victory' then 'victory'
          when 'defeat' then 'defeat'
          else 'draw'
        end,
        'trophiesDelta', coalesce((item #>> '{battle,trophyChange}')::integer, 0),
        'raw', item
      ))
      from jsonb_array_elements(battle_items) as item
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.buscar_brawl_stars(text) from public;
grant execute on function public.buscar_brawl_stars(text) to authenticated;
