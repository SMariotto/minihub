import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { authService } from "@minihub/business-logic";

type AuthMode = "login" | "signup";

function stringifyForDisplay(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message === "[object Object]" ? fallback : err.message;
  return stringifyForDisplay(err) || fallback;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function BrawlStarsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 29,18 44,18 32,28 37,42 24,33 11,42 16,28 4,18 19,18" fill="#e8ff47" opacity="0.9" />
    </svg>
  );
}

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isLogin = mode === "login";

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  const toggleMode = () => {
    setMode(isLogin ? "signup" : "login");
    clearForm();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Preencha o e-mail e a senha para continuar.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = isLogin
        ? await authService.signInWithEmail(email.trim(), password)
        : await authService.signUpWithEmail(email.trim(), password);

      onLoginSuccess(user);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ocorreu um erro inesperado."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao iniciar login com Google."));
      setGoogleLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputClass = `
    w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl px-4 py-3
    text-white text-sm font-body placeholder-white/20
    focus:outline-none focus:border-[#e8ff47]/50
    transition-colors duration-200 disabled:opacity-50
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center">
            <BrawlStarsIcon />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-display text-5xl tracking-widest text-white">
              MINIhub
            </h1>
            <p className="text-white/30 text-sm font-body">
              {isLogin ? "Acesse sua conta para continuar" : "Crie sua conta gratuitamente"}
            </p>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex p-1 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl">
            {(["login", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); clearForm(); }}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200
                  ${mode === m ? "bg-[#e8ff47] text-[#0a0a0a]" : "text-white/40 hover:text-white/70"}
                `}
              >
                {m === "login" ? "Fazer Login" : "Criar Conta"}
              </button>
            ))}
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#1f1f1f] bg-white/5 hover:bg-white/10 text-white text-sm font-body font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Redirecionando..." : "Entrar com o Google"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1f1f1f]" />
            <span className="text-xs text-white/20 font-body tracking-widest uppercase">ou</span>
            <div className="flex-1 h-px bg-[#1f1f1f]" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/40 font-body tracking-widest uppercase">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || googleLoading}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/40 font-body tracking-widest uppercase">
                Senha
              </label>
              <input
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || googleLoading}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs text-red-400 font-body leading-relaxed">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e8ff47] text-[#0a0a0a] text-sm font-body font-semibold hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {isLogin ? "Entrando..." : "Criando conta..."}
              </>
            ) : (
              isLogin ? "Entrar na conta" : "Criar minha conta"
            )}
          </button>

          <p className="text-center text-xs text-white/25 font-body">
            {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={toggleMode}
              disabled={loading || googleLoading}
              className="text-[#e8ff47]/70 hover:text-[#e8ff47] transition-colors duration-200 disabled:opacity-50"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-white/15 font-body">
          MINIhub · Plataforma de Gestão Gaming
        </p>
      </div>
    </div>
  );
}
