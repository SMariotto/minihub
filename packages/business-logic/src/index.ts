import { createClient } from '@supabase/supabase-js';

// 1. Inicializa o Supabase com tratamento para o Vite
const url = import.meta.env?.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(url, anonKey);

// 2. O Serviço de Autenticação que o seu Login.tsx usa (Google e Email)
export const authService = {
  async loginWithEmail(email: string) {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
  },
  async loginWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },
  async logout() {
    return await supabase.auth.signOut();
  }
};

// 3. Suas funções de negócio de troféus originais intactas
export function converterDataEmDias(dataFinal: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataFinal);
  alvo.setHours(0, 0, 0, 0);
  const diffMs = alvo.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
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