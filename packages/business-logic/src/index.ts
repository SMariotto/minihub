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
    const { data, error } = await supabase.rpc("buscar_brawl_stars", {
      player_tag: playerTag.trim(),
    });

    if (error) throw error;
    if (!data) throw new Error("Jogador não encontrado.");

    const player = Array.isArray(data) ? data[0] : data;
    if (!player || typeof player.trophies !== "number") {
      throw new Error("Resposta inválida ao buscar dados do jogador.");
    }

    return {
      name: String(player.name ?? ""),
      trophies: player.trophies,
    };
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
