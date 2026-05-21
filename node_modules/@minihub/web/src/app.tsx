import { useState } from "react";

type CardStatus = "active" | "locked";

interface HubCard {
  id: number;
  title: string;
  description: string;
  status: CardStatus;
  accentColor: string;
}

const cards: HubCard[] = [
  {
    id: 1,
    title: "Brawl Stars",
    description: "Gerenciador de Metas de Troféus",
    status: "active",
    accentColor: "#e8ff47",
  },
  {
    id: 2,
    title: "Clash Royale",
    description: "Em breve",
    status: "locked",
    accentColor: "#4fffff",
  },
  {
    id: 3,
    title: "Clash of Clans",
    description: "Em breve",
    status: "locked",
    accentColor: "#ff9d4e",
  },
];

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BrawlStarsIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="24,4 29,18 44,18 32,28 37,42 24,33 11,42 16,28 4,18 19,18"
        fill="#e8ff47"
        opacity="0.9"
      />
    </svg>
  );
}

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);

  const handleCardClick = (card: HubCard) => {
    if (card.status === "locked") return;
    setSelected(card.id);
  };

  return (
    <div className="min-h-screen bg-surface font-body flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-border">
        <span className="font-display text-3xl tracking-widest text-white">
          MINIhub
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/40">Olá,</span>
          <span className="text-sm text-white/80 font-medium">Admin</span>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-[#0a0a0a] text-xs font-display tracking-wide">
              A
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-white/90 text-2xl font-display tracking-widest uppercase">
            Seus Jogos
          </h2>
          <p className="text-white/30 text-sm">
            Selecione um módulo para começar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative rounded-2xl border overflow-hidden
                transition-all duration-300 select-none
                ${
                  card.status === "active"
                    ? "bg-panel border-border cursor-pointer group hover:border-accent hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(232,255,71,0.08)]"
                    : "bg-[#0d0d0d] border-border opacity-50 cursor-not-allowed"
                }
                ${selected === card.id ? "border-accent ring-1 ring-accent/30" : ""}
              `}
              style={{ minHeight: "220px" }}
            >
              {card.status === "locked" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20 z-10">
                  <LockIcon />
                  <span className="text-xs tracking-widest uppercase">
                    Em Breve
                  </span>
                </div>
              )}

              <div
                className={`p-6 flex flex-col justify-between h-full gap-8 ${card.status === "locked" ? "opacity-0" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${card.accentColor}15`,
                      border: `1px solid ${card.accentColor}30`,
                    }}
                  >
                    {card.id === 1 && <BrawlStarsIcon />}
                  </div>
                  {selected === card.id && card.status === "active" && (
                    <span
                      className="text-[10px] font-body tracking-widest uppercase px-2 py-1 rounded-md"
                      style={{
                        color: card.accentColor,
                        background: `${card.accentColor}18`,
                        border: `1px solid ${card.accentColor}30`,
                      }}
                    >
                      Ativo
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h3
                    className="font-display text-2xl tracking-wider transition-colors duration-300"
                    style={{
                      color:
                        card.status === "active" ? "white" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/30 font-light">
                    {card.description}
                  </p>
                </div>

                {card.status === "active" && (
                  <div
                    className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${card.accentColor}80, transparent)`,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {selected !== null && (
          <div className="mt-4 flex items-center gap-3 px-5 py-4 rounded-xl border border-accent/20 bg-accent/5 w-fit">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-accent/80 font-medium">
              Módulo{" "}
              <strong className="text-accent">
                {cards.find((c) => c.id === selected)?.title}
              </strong>{" "}
              carregado — em construção.
            </span>
          </div>
        )}
      </main>
    </div>
  );
}