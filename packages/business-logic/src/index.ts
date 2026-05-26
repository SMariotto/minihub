import {
  AuthChangeEvent,
  createClient,
  Session,
  User,
} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[business-logic] Supabase não configurado: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export type AuthStateCallback = (user: User | null) => void;

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Usuário não retornado após o login.");
    }

    return data.user;
  },

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Usuário não retornado após o cadastro.");
    }

    return data.user;
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://minihub-web.vercel.app' },
    });

    if (error) throw error;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ?? null;
  },

  onAuthStateChange(callback: AuthStateCallback): { unsubscribe: () => void } {
    const { data } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        callback(session?.user ?? null);
      }
    );

    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};

export function converterDataEmDias(dataFinal: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataFinal);
  alvo.setHours(0, 0, 0, 0);
  const diffMs = alvo.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function converterDiasEmData(dias: number): string {
  const alvo = new Date();
  alvo.setHours(0, 0, 0, 0);
  alvo.setDate(alvo.getDate() + Math.max(0, dias));
  return alvo.toISOString().slice(0, 10);
}

export function calcularMetaDiaria(
  trofeusAtuais: number,
  metaTrofeus: number,
  dias: number
): number {
  if (dias <= 0) return 0;
  const faltam = metaTrofeus - trofeusAtuais;
  if (faltam <= 0) return 0;
  return Math.ceil(faltam / dias);
}

export interface BrawlPlayerData {
  name: string;
  trophies: number;
  tag: string;
  expLevel: number;
  brawlersUnlocked: number;
  totalBrawlers: number;
  powerLevelTotal: number;
  maxPowerLevelTotal: number;
  gadgetsOwned: number;
  maxGadgets: number;
  starPowersOwned: number;
  maxStarPowers: number;
  totalVictories: number;
  battlelog: BrawlBattleLogItem[];
}

export interface BrawlBattleLogItem {
  battleTime: string;
  result: "victory" | "defeat" | "draw";
  trophiesDelta: number;
  raw: unknown;
}

interface BrawlApiBrawler {
  power?: number;
  gadgets?: unknown[];
  starPowers?: unknown[];
}

interface BrawlApiProfile {
  tag?: string;
  name?: string;
  trophies?: number;
  expLevel?: number;
  "3vs3Victories"?: number;
  soloVictories?: number;
  duoVictories?: number;
  brawlers?: BrawlApiBrawler[];
}

interface BrawlApiBattleLogItem {
  battleTime?: string;
  battle?: {
    result?: string;
    trophyChange?: number;
  };
}

export interface BrawlProfile {
  user_id: string;
  player_tag: string;
  player_name: string | null;
  current_trophies: number | null;
  updated_at?: string;
}

export interface BrawlGoal {
  id?: string;
  user_id: string;
  player_tag: string | null;
  player_name: string | null;
  trofeus_atuais: number;
  trofeus_meta: number;
  data_final: string;
  prazo_dias: number;
  updated_at?: string;
}

export interface BrawlGoalInput {
  userId: string;
  playerTag: string | null;
  playerName: string | null;
  trofeusAtuais: number;
  trofeusMeta: number;
  dataFinal: string;
}

export interface AccountValueInput {
  brawlersUnlocked: number;
  totalBrawlers: number;
  powerLevelTotal: number;
  maxPowerLevelTotal: number;
  gadgetsOwned: number;
  maxGadgets: number;
  starPowersOwned: number;
  maxStarPowers: number;
  xpLevel: number;
}

export interface AccountValueScore {
  rawScore: number;
  ageAdjustedScore: number;
  maturityFactor: number;
}

export type BrawlRankingPeriod = "all-time" | "monthly" | "daily" | "average";

export interface BrawlRankingRow {
  user_id: string;
  player_tag: string;
  player_name: string | null;
  victories: number;
  defeats: number;
  participations: number;
  trophies_delta: number;
  performance_average: number;
}

function normalizeBattleResult(result: string | undefined): "victory" | "defeat" | "draw" {
  if (result === "victory") return "victory";
  if (result === "defeat") return "defeat";
  return "draw";
}

function normalizePlayerTag(playerTag: string): string {
  const tag = playerTag.trim().toUpperCase();
  return tag.startsWith("#") ? tag : `#${tag}`;
}

function mapBrawlApiResponse(response: { profile: BrawlApiProfile; battlelog?: { items?: BrawlApiBattleLogItem[] } }): BrawlPlayerData {
  const brawlers = response.profile.brawlers ?? [];
  const totalVictories =
    (response.profile["3vs3Victories"] ?? 0) +
    (response.profile.soloVictories ?? 0) +
    (response.profile.duoVictories ?? 0);

  return {
    name: String(response.profile.name ?? ""),
    tag: String(response.profile.tag ?? ""),
    trophies: response.profile.trophies ?? 0,
    expLevel: response.profile.expLevel ?? 0,
    brawlersUnlocked: brawlers.length,
    totalBrawlers: Math.max(1, brawlers.length),
    powerLevelTotal: brawlers.reduce((sum, brawler) => sum + (brawler.power ?? 0), 0),
    maxPowerLevelTotal: Math.max(1, brawlers.length * 11),
    gadgetsOwned: brawlers.reduce((sum, brawler) => sum + (brawler.gadgets?.length ?? 0), 0),
    maxGadgets: Math.max(1, brawlers.length * 2),
    starPowersOwned: brawlers.reduce((sum, brawler) => sum + (brawler.starPowers?.length ?? 0), 0),
    maxStarPowers: Math.max(1, brawlers.length * 2),
    totalVictories,
    battlelog: (response.battlelog?.items ?? []).map((item) => ({
      battleTime: item.battleTime ?? new Date().toISOString(),
      result: normalizeBattleResult(item.battle?.result),
      trophiesDelta: item.battle?.trophyChange ?? 0,
      raw: item,
    })),
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratio(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, value / max));
}

export function calculateAccountValueScore(input: AccountValueInput): AccountValueScore {
  const collectionScore = ratio(input.brawlersUnlocked, input.totalBrawlers) * 35;
  const powerScore = ratio(input.powerLevelTotal, input.maxPowerLevelTotal) * 30;
  const gadgetScore = ratio(input.gadgetsOwned, input.maxGadgets) * 15;
  const starPowerScore = ratio(input.starPowersOwned, input.maxStarPowers) * 15;
  const xpScore = ratio(input.xpLevel, 300) * 5;
  const rawScore = clampScore(collectionScore + powerScore + gadgetScore + starPowerScore + xpScore);
  const maturityFactor = Math.max(0.75, Math.min(1.15, 1 + (input.xpLevel - 120) / 1000));

  return {
    rawScore,
    ageAdjustedScore: clampScore(rawScore * maturityFactor),
    maturityFactor: Math.round(maturityFactor * 100) / 100,
  };
}

export const brawlProfileService = {
  async getProfile(userId: string): Promise<BrawlProfile | null> {
    const { data, error } = await supabase
      .from("brawl_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as BrawlProfile | null;
  },

  async savePlayerTag(userId: string, playerTag: string): Promise<BrawlProfile> {
    const normalizedTag = playerTag.trim().toUpperCase();
    const player = await brawlGoalService.fetchPlayer(normalizedTag);
    const payload = {
      user_id: userId,
      player_tag: normalizedTag,
      player_name: player.name,
      current_trophies: player.trophies,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("brawl_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    await brawlGoalService.storePlayerHistory(userId, player);
    return data as BrawlProfile;
  },

  async syncProfile(userId: string): Promise<BrawlProfile | null> {
    const profile = await this.getProfile(userId);
    if (!profile?.player_tag) return profile;
    return this.savePlayerTag(userId, profile.player_tag);
  },
};

export const brawlGoalService = {
  async fetchPlayer(playerTag: string): Promise<BrawlPlayerData> {
    const response = await fetch(`/api/brawl-stars/player?tag=${encodeURIComponent(normalizePlayerTag(playerTag))}`, {
      headers: { Accept: "application/json" },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message ?? data?.error ?? "Erro ao buscar jogador na API oficial.");
    }
    if (!data?.profile) throw new Error("Jogador não encontrado.");

    return mapBrawlApiResponse(data);
  },

  async storePlayerHistory(userId: string, player: BrawlPlayerData): Promise<void> {
    const snapshot = {
      user_id: userId,
      player_tag: player.tag || normalizePlayerTag(player.name),
      total_victories: player.totalVictories,
      current_trophies: player.trophies,
      exp_level: player.expLevel,
      raw_payload: {
        brawlersUnlocked: player.brawlersUnlocked,
        powerLevelTotal: player.powerLevelTotal,
        gadgetsOwned: player.gadgetsOwned,
        starPowersOwned: player.starPowersOwned,
      },
    };

    await supabase.from("brawl_player_snapshots").insert(snapshot);

    if (player.battlelog.length === 0) return;

    const rows = player.battlelog.map((battle) => ({
      user_id: userId,
      player_tag: player.tag,
      battle_time: battle.battleTime,
      result: battle.result,
      trophies_delta: battle.trophiesDelta,
      participation_count: 1,
      raw_payload: battle.raw,
    }));

    await supabase.from("brawl_match_history").upsert(rows, {
      onConflict: "user_id,battle_time,player_tag",
      ignoreDuplicates: true,
    });
  },

  async getGoal(userId: string): Promise<BrawlGoal | null> {
    const { data, error } = await supabase
      .from("metas_brawl")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as BrawlGoal | null;
  },

  async saveGoal(input: BrawlGoalInput): Promise<BrawlGoal> {
    const prazoDias = converterDataEmDias(input.dataFinal);
    const payload = {
      user_id: input.userId,
      player_tag: input.playerTag,
      player_name: input.playerName,
      trofeus_atuais: input.trofeusAtuais,
      trofeus_meta: input.trofeusMeta,
      data_final: input.dataFinal,
      prazo_dias: prazoDias,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("metas_brawl")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    return data as BrawlGoal;
  },

  async syncSavedGoal(userId: string): Promise<BrawlGoal | null> {
    const goal = await this.getGoal(userId);
    if (!goal) return null;

    const dataFinal = goal.data_final;
    const prazoDias = converterDataEmDias(dataFinal);

    if (!goal.player_tag) {
      return this.saveGoal({
        userId,
        playerTag: goal.player_tag,
        playerName: goal.player_name,
        trofeusAtuais: goal.trofeus_atuais,
        trofeusMeta: goal.trofeus_meta,
        dataFinal,
      });
    }

    const player = await this.fetchPlayer(goal.player_tag);
    return this.saveGoal({
      userId,
      playerTag: goal.player_tag,
      playerName: player.name || goal.player_name,
      trofeusAtuais: player.trophies,
      trofeusMeta: goal.trofeus_meta,
      dataFinal: prazoDias > 0 ? dataFinal : goal.data_final,
    });
  },
};

export const brawlRankingService = {
  async getRankings(period: BrawlRankingPeriod): Promise<BrawlRankingRow[]> {
    const since = new Date();
    if (period === "daily") {
      since.setHours(0, 0, 0, 0);
    } else if (period === "monthly") {
      since.setDate(1);
      since.setHours(0, 0, 0, 0);
    } else {
      since.setTime(0);
    }

    const { data: snapshots, error: snapshotError } = await supabase
      .from("brawl_player_snapshots")
      .select("user_id, player_tag, total_victories, current_trophies, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (snapshotError) throw snapshotError;

    const { data: battles, error: battleError } = await supabase
      .from("brawl_match_history")
      .select("user_id, player_tag, result, participation_count, trophies_delta, battle_time")
      .gte("battle_time", since.toISOString());

    if (battleError) throw battleError;

    const rows = new Map<string, BrawlRankingRow>();

    for (const snapshot of snapshots ?? []) {
      const key = `${snapshot.user_id}:${snapshot.player_tag}`;
      if (!rows.has(key)) {
        rows.set(key, {
          user_id: String(snapshot.user_id),
          player_tag: String(snapshot.player_tag),
          player_name: null,
          victories: Number(snapshot.total_victories ?? 0),
          defeats: 0,
          participations: 0,
          trophies_delta: Number(snapshot.current_trophies ?? 0),
          performance_average: 0,
        });
      }
    }

    for (const battle of battles ?? []) {
      const key = `${battle.user_id}:${battle.player_tag}`;
      const row = rows.get(key) ?? {
        user_id: String(battle.user_id),
        player_tag: String(battle.player_tag),
        player_name: null,
        victories: 0,
        defeats: 0,
        participations: 0,
        trophies_delta: 0,
        performance_average: 0,
      };

      row.victories += battle.result === "victory" ? 1 : 0;
      row.defeats += battle.result === "defeat" ? 1 : 0;
      row.participations += Number(battle.participation_count ?? 0);
      row.trophies_delta += Number(battle.trophies_delta ?? 0);
      rows.set(key, row);
    }

    return Array.from(rows.values())
      .map((row) => ({
        ...row,
        performance_average: row.participations > 0 ? Math.round((row.victories / row.participations) * 100) : 0,
      }))
      .sort((a, b) => {
        if (period === "average") return b.performance_average - a.performance_average;
        return b.victories - a.victories || b.trophies_delta - a.trophies_delta;
      });
  },
};
