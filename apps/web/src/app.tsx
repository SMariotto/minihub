import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { authService } from "@minihub/business-logic";
import Login from "./pages/Login";
import {
  AccountValueInput,
  brawlProfileService,
  brawlGoalService,
  calcularMetaDiaria,
  calculateAccountValueScore,
  converterDataEmDias,
  converterDiasEmData,
} from "@minihub/business-logic";

type View = "home" | "brawl";
type BrawlTab = "calculator" | "value" | "rankings";
type RankingTab = "all-time" | "monthly" | "daily" | "average";
type PrazoMode = "dias" | "data";
type SyncStatus = "idle" | "loading" | "success" | "error";
type SaveStatus = "idle" | "saving" | "success" | "error";

interface HubCard {
  id: number;
  title: string;
  description: string;
  status: "active" | "locked";
  accentColor: string;
}

const cards: HubCard[] = [
  { id: 1, title: "Brawl Stars", description: "Ferramentas, metas e rankings", status: "active", accentColor: "#e8ff47" },
  { id: 2, title: "Clash Royale", description: "Em breve", status: "locked", accentColor: "#4fffff" },
  { id: 3, title: "Clash of Clans", description: "Em breve", status: "locked", accentColor: "#ff9d4e" },
];

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BrawlStarsIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 29,18 44,18 32,28 37,42 24,33 11,42 16,28 4,18 19,18" fill="#e8ff47" opacity="0.9" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function HomeView({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="flex-1 px-8 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-white/90 text-2xl font-display tracking-widest uppercase">Seus Jogos</h2>
        <p className="text-white/30 text-sm">Selecione um módulo para começar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => card.status === "active" && onNavigate("brawl")}
            className={`
              relative rounded-2xl border overflow-hidden transition-all duration-300 select-none
              ${card.status === "active"
                ? "bg-panel border-border cursor-pointer group hover:border-accent hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(232,255,71,0.08)]"
                : "bg-[#0d0d0d] border-border opacity-50 cursor-not-allowed"
              }
            `}
            style={{ minHeight: "220px" }}
          >
            {card.status === "locked" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20 z-10">
                <LockIcon />
                <span className="text-xs tracking-widest uppercase">Em Breve</span>
              </div>
            )}
            <div className={`p-6 flex flex-col justify-between h-full gap-8 ${card.status === "locked" ? "opacity-0" : ""}`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${card.accentColor}15`, border: `1px solid ${card.accentColor}30` }}>
                {card.id === 1 && <BrawlStarsIcon size={32} />}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-2xl tracking-wider text-white">{card.title}</h3>
                <p className="text-sm text-white/30 font-light">{card.description}</p>
              </div>
              {card.status === "active" && (
                <div className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" style={{ background: `linear-gradient(to right, ${card.accentColor}80, transparent)` }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrophyCalculatorView({
  user,
  playerTag,
  playerName,
  currentTrophies,
}: {
  user: User;
  playerTag: string;
  playerName: string;
  currentTrophies: number | null;
}) {
  const [syncError, setSyncError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [trofeusAtuais, setTrofeusAtuais] = useState(currentTrophies?.toString() ?? "");
  const [metaTrofeus, setMetaTrofeus] = useState("");
  const [prazoMode, setPrazoMode] = useState<PrazoMode>("dias");
  const [numeroDias, setNumeroDias] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const dataFinalResolvida = prazoMode === "dias" ? converterDiasEmData(parseInt(numeroDias) || 0) : dataFinal;
  const diasResolvidos = dataFinalResolvida ? converterDataEmDias(dataFinalResolvida) : 0;
  const atual = parseInt(trofeusAtuais) || 0;
  const meta = parseInt(metaTrofeus) || 0;
  const metaDiaria = calcularMetaDiaria(atual, meta, diasResolvidos);
  const trofeusFaltando = Math.max(0, meta - atual);
  const resultadoValido = diasResolvidos > 0 && meta > atual;

  useEffect(() => {
    let active = true;

    async function loadSavedGoal() {
      setSyncStatus("loading");
      setSyncError("");
      try {
        const goal = await brawlGoalService.syncSavedGoal(user.id);
        if (!active) return;
        if (!goal) {
          setTrofeusAtuais(currentTrophies?.toString() ?? "");
          setSyncStatus("idle");
          return;
        }

        setTrofeusAtuais(goal.trofeus_atuais.toString());
        setMetaTrofeus(goal.trofeus_meta.toString());
        setPrazoMode("data");
        setDataFinal(goal.data_final);
        setNumeroDias(goal.prazo_dias.toString());
        setSyncStatus("success");
      } catch (err: unknown) {
        if (!active) return;
        setSyncStatus("error");
        setSyncError(err instanceof Error ? err.message : "Erro ao carregar meta salva.");
      }
    }

    loadSavedGoal();

    return () => {
      active = false;
    };
  }, [currentTrophies, user.id]);

  const handleSync = async () => {
    if (!playerTag.trim()) return;
    setSyncStatus("loading");
    setSyncError("");
    try {
      const player = await brawlGoalService.fetchPlayer(playerTag.trim());
      setTrofeusAtuais(player.trophies.toString());
      setSyncStatus("success");
    } catch (err: unknown) {
      setSyncStatus("error");
      setSyncError(err instanceof Error ? err.message : "Erro desconhecido ao buscar jogador.");
    }
  };

  const handleSave = async () => {
    if (!resultadoValido) return;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const goal = await brawlGoalService.saveGoal({
        userId: user.id,
        playerTag: playerTag.trim() || null,
        playerName: playerName || null,
        trofeusAtuais: atual,
        trofeusMeta: meta,
        dataFinal: dataFinalResolvida,
      });

      setPrazoMode("data");
      setDataFinal(goal.data_final);
      setNumeroDias(goal.prazo_dias.toString());
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: unknown) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar meta.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const inputClass = "w-full bg-[#0d0d0d] border border-border rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors duration-200";

  return (
    <div className="flex-1 px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-3xl tracking-widest text-white uppercase">Configurar Meta</h2>
          <p className="text-sm text-white/30">Preencha os dados para calcular sua meta diária</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/40 tracking-widest uppercase">Jogador Vinculado</label>
          <div className="flex gap-2">
            <input type="text" value={playerTag || "Cadastre sua Tag no topo"} readOnly className={inputClass + " flex-1"} />
            <button onClick={handleSync} disabled={syncStatus === "loading" || !playerTag.trim()} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-accent/30 bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap">
              {syncStatus === "loading" ? <SpinnerIcon /> : <SyncIcon />}
              {syncStatus === "loading" ? "Buscando..." : "Sincronizar"}
            </button>
          </div>
          {syncStatus === "success" && playerName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
              <CheckIcon />
              <span className="text-xs text-accent font-medium">{playerName} · {trofeusAtuais} troféus sincronizados!</span>
            </div>
          )}
          {syncStatus === "error" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-xs text-red-400">{syncError || "Tag não encontrada — verifique e tente novamente."}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/40 tracking-widest uppercase">Troféus Atuais</label>
          <input type="number" placeholder="Ex: 45000" value={trofeusAtuais} onChange={(e) => setTrofeusAtuais(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/40 tracking-widest uppercase">Meta de Troféus</label>
          <input type="number" placeholder="Ex: 50000" value={metaTrofeus} onChange={(e) => setMetaTrofeus(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xs text-white/40 tracking-widest uppercase">Prazo</label>
          <div className="flex gap-2 p-1 bg-[#0d0d0d] border border-border rounded-xl w-fit">
            {(["dias", "data"] as PrazoMode[]).map((mode) => (
              <button key={mode} onClick={() => setPrazoMode(mode)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${prazoMode === mode ? "bg-accent text-[#0a0a0a]" : "text-white/40 hover:text-white/70"}`}>
                {mode === "dias" ? "Nº de Dias" : "Data Final"}
              </button>
            ))}
          </div>
          {prazoMode === "dias" ? (
            <input type="number" placeholder="Ex: 30" value={numeroDias} onChange={(e) => setNumeroDias(e.target.value)} className={inputClass} />
          ) : (
            <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className={inputClass + " [color-scheme:dark]"} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-10">
        <label className="text-xs text-white/40 tracking-widest uppercase">Resultado</label>
        <div
          className="rounded-2xl border p-8 flex flex-col gap-8 transition-all duration-500"
          style={{
            background: resultadoValido ? "rgba(232,255,71,0.03)" : "#0d0d0d",
            borderColor: resultadoValido ? "rgba(232,255,71,0.35)" : "#1f1f1f",
            boxShadow: resultadoValido ? "0 0 48px rgba(232,255,71,0.06)" : "none",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <TrophyIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-display text-lg tracking-wider">Brawl Stars</span>
              {(playerTag || playerName) && (
                <span className="text-white/30 text-xs font-mono">{playerName ? `${playerName} · ${playerTag}` : playerTag}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-xs text-white/30 tracking-widest uppercase">Meta Diária</span>
            <span className="font-display leading-none tracking-tight transition-all duration-300" style={{ fontSize: "clamp(4rem, 12vw, 7rem)", color: resultadoValido ? "#e8ff47" : "rgba(255,255,255,0.08)" }}>
              {resultadoValido ? metaDiaria : "—"}
            </span>
            {resultadoValido && <span className="text-white/30 text-sm">troféus por dia</span>}
          </div>
          <div className="border-t border-white/5 pt-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-white/25 tracking-widest uppercase">Dias Restantes</span>
              <span className="text-white font-display text-2xl tracking-wide">{diasResolvidos > 0 ? diasResolvidos : "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-white/25 tracking-widest uppercase">Total Faltando</span>
              <span className="text-white font-display text-2xl tracking-wide">{trofeusFaltando > 0 ? trofeusFaltando.toLocaleString("pt-BR") : "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-white/25 tracking-widest uppercase">Atual</span>
              <span className="text-white/60 font-display text-2xl tracking-wide">{atual > 0 ? atual.toLocaleString("pt-BR") : "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-white/25 tracking-widest uppercase">Meta</span>
              <span className="text-white/60 font-display text-2xl tracking-wide">{meta > 0 ? meta.toLocaleString("pt-BR") : "—"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!resultadoValido || saveStatus === "saving" || saveStatus === "success"}
          className={`
            w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
            text-sm font-medium tracking-wide transition-all duration-300
            ${resultadoValido && saveStatus === "idle" ? "bg-accent text-[#0a0a0a] hover:brightness-110 cursor-pointer"
              : saveStatus === "success" ? "bg-accent/10 border border-accent/30 text-accent cursor-default"
              : saveStatus === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400 cursor-default"
              : "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed"}
          `}
        >
          {saveStatus === "idle" && <><SaveIcon /> Salvar Meta no Banco</>}
          {saveStatus === "saving" && <><SpinnerIcon /> Salvando...</>}
          {saveStatus === "success" && <><CheckIcon /> Meta salva com sucesso na nuvem!</>}
          {saveStatus === "error" && <><span>✕</span> {saveError || "Erro ao salvar — tente novamente"}</>}
        </button>
      </div>
    </div>
  );
}

function AccountValueView() {
  const [values, setValues] = useState<AccountValueInput>({
    brawlersUnlocked: 0,
    totalBrawlers: 80,
    powerLevelTotal: 0,
    maxPowerLevelTotal: 880,
    gadgetsOwned: 0,
    maxGadgets: 160,
    starPowersOwned: 0,
    maxStarPowers: 160,
    xpLevel: 1,
  });
  const score = calculateAccountValueScore(values);
  const inputClass = "w-full bg-[#0d0d0d] border border-border rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors duration-200";
  const updateValue = (key: keyof AccountValueInput, value: string) => {
    setValues((current) => ({ ...current, [key]: Math.max(0, parseInt(value) || 0) }));
  };

  return (
    <div className="flex-1 px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ["brawlersUnlocked", "Brawlers Liberados"],
          ["totalBrawlers", "Total de Brawlers"],
          ["powerLevelTotal", "Soma dos Níveis de Poder"],
          ["maxPowerLevelTotal", "Máximo de Níveis de Poder"],
          ["gadgetsOwned", "Acessórios"],
          ["maxGadgets", "Máximo de Acessórios"],
          ["starPowersOwned", "Star Powers"],
          ["maxStarPowers", "Máximo de Star Powers"],
          ["xpLevel", "Nível de XP"],
        ].map(([key, label]) => (
          <label key={key} className="flex flex-col gap-2">
            <span className="text-xs text-white/40 tracking-widest uppercase">{label}</span>
            <input
              type="number"
              value={values[key as keyof AccountValueInput]}
              onChange={(event) => updateValue(key as keyof AccountValueInput, event.target.value)}
              className={inputClass}
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-[#0d0d0d] p-8 flex flex-col gap-6 lg:sticky lg:top-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/30 tracking-widest uppercase">Valor da Conta</span>
          <span className="font-display text-7xl leading-none text-accent">{score.ageAdjustedScore}</span>
          <span className="text-sm text-white/30">nota corrigida por maturidade</span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-white/25 tracking-widest uppercase">Nota Bruta</span>
            <span className="text-white font-display text-3xl">{score.rawScore}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-white/25 tracking-widest uppercase">Fator XP</span>
            <span className="text-white font-display text-3xl">{score.maturityFactor.toFixed(2)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingsView() {
  const [rankingTab, setRankingTab] = useState<RankingTab>("all-time");
  const tabs: Array<{ id: RankingTab; label: string }> = [
    { id: "all-time", label: "Desde Sempre" },
    { id: "monthly", label: "Mensal" },
    { id: "daily", label: "Diário" },
    { id: "average", label: "Média de Desempenho" },
  ];

  return (
    <div className="flex-1 px-6 md:px-10 py-10 flex flex-col gap-6">
      <div className="flex gap-2 p-1 bg-[#0d0d0d] border border-border rounded-xl w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRankingTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${rankingTab === tab.id ? "bg-accent text-[#0a0a0a]" : "text-white/40 hover:text-white/70"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-[#0d0d0d] overflow-hidden">
        <div className="grid grid-cols-[64px_1fr_repeat(3,minmax(80px,120px))] gap-4 px-5 py-3 border-b border-border text-[11px] text-white/25 tracking-widest uppercase">
          <span>#</span>
          <span>Jogador</span>
          <span>Vitórias</span>
          <span>Derrotas</span>
          <span>Partidas</span>
        </div>
        <div className="px-5 py-10 text-center text-sm text-white/30">
          Ranking {tabs.find((tab) => tab.id === rankingTab)?.label} pronto para receber históricos do Supabase.
        </div>
      </div>
    </div>
  );
}

function BrawlStarsView({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<BrawlTab>("calculator");
  const [playerTag, setPlayerTag] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [currentTrophies, setCurrentTrophies] = useState<number | null>(null);
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");
  const [profileError, setProfileError] = useState("");
  const inputClass = "w-full bg-[#0d0d0d] border border-border rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-accent/50 transition-colors duration-200";
  const tabs: Array<{ id: BrawlTab; label: string }> = [
    { id: "calculator", label: "Calculadora de Troféus" },
    { id: "value", label: "Valor da Conta" },
    { id: "rankings", label: "Rankings" },
  ];

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setProfileStatus("saving");
      setProfileError("");
      try {
        const profile = await brawlProfileService.syncProfile(user.id);
        if (!active) return;
        setPlayerTag(profile?.player_tag ?? "");
        setPlayerName(profile?.player_name ?? "");
        setCurrentTrophies(profile?.current_trophies ?? null);
        setProfileStatus("idle");
      } catch (err: unknown) {
        if (!active) return;
        setProfileStatus("error");
        setProfileError(err instanceof Error ? err.message : "Erro ao carregar Tag.");
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user.id]);

  const handleSaveTag = async () => {
    if (!playerTag.trim()) return;
    setProfileStatus("saving");
    setProfileError("");
    try {
      const profile = await brawlProfileService.savePlayerTag(user.id, playerTag);
      setPlayerTag(profile.player_tag);
      setPlayerName(profile.player_name ?? "");
      setCurrentTrophies(profile.current_trophies ?? null);
      setProfileStatus("success");
      setTimeout(() => setProfileStatus("idle"), 3000);
    } catch (err: unknown) {
      setProfileStatus("error");
      setProfileError(err instanceof Error ? err.message : "Erro ao salvar Tag.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 md:px-10 pt-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <BrawlStarsIcon size={36} />
              <h2 className="font-display text-4xl tracking-widest text-white uppercase">Brawl Stars</h2>
            </div>
            <p className="text-sm text-white/30">Tag única persistida para todas as ferramentas do módulo.</p>
          </div>
          <div className="w-full lg:w-[520px] flex flex-col gap-2">
            <label className="text-xs text-white/40 tracking-widest uppercase">Brawl Stars ID</label>
            <div className="flex gap-2">
              <input
                value={playerTag}
                onChange={(event) => setPlayerTag(event.target.value.toUpperCase())}
                placeholder="#PLAYER TAG"
                className={inputClass}
              />
              <button
                onClick={handleSaveTag}
                disabled={profileStatus === "saving" || !playerTag.trim()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-accent/30 bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
              >
                {profileStatus === "saving" ? <SpinnerIcon /> : <SaveIcon />}
                Salvar Tag
              </button>
            </div>
            {playerName && (
              <span className="text-xs text-accent">{playerName} · {(currentTrophies ?? 0).toLocaleString("pt-BR")} troféus</span>
            )}
            {profileStatus === "error" && <span className="text-xs text-red-400">{profileError}</span>}
            {profileStatus === "success" && <span className="text-xs text-accent">Tag salva e sincronizada.</span>}
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-[#0d0d0d] border border-border rounded-xl w-fit max-w-full overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? "bg-accent text-[#0a0a0a]" : "text-white/40 hover:text-white/70"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "calculator" && (
        <TrophyCalculatorView
          user={user}
          playerTag={playerTag}
          playerName={playerName}
          currentTrophies={currentTrophies}
        />
      )}
      {activeTab === "value" && <AccountValueView />}
      {activeTab === "rankings" && <RankingsView />}
    </div>
  );
}

function MainApp({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [view, setView] = useState<View>("home");
  const displayName = user.user_metadata?.full_name ?? user.email ?? "Usuário";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-surface font-body flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-4">
          {view !== "home" && (
            <button onClick={() => setView("home")} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200 text-sm">
              <ArrowLeftIcon />
              <span className="hidden sm:inline">Voltar ao Hub</span>
            </button>
          )}
          {view !== "home" && <div className="w-px h-5 bg-border" />}
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl tracking-widest text-white">MINIhub</span>
            {view === "brawl" && (
              <span className="text-xs text-accent/70 border border-accent/20 bg-accent/10 px-2 py-0.5 rounded-md font-body tracking-widest uppercase">
                Brawl Stars
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/40 hidden sm:inline">Olá,</span>
          <span className="text-sm text-white/80 font-medium hidden sm:inline truncate max-w-[140px]">{displayName}</span>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-[#0a0a0a] text-xs font-display tracking-wide">{avatarLetter}</span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-white/30 hover:text-white hover:border-white/20 transition-colors duration-200 text-xs"
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {view === "home" && <HomeView onNavigate={setView} />}
      {view === "brawl" && <BrawlStarsView user={user} />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { unsubscribe } = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon className="w-8 h-8 text-accent" />
          <span className="text-white/20 text-xs font-body tracking-widest uppercase">Carregando</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainApp user={user} onSignOut={handleSignOut} />;
}
