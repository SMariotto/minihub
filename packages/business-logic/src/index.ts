import { createClient } from '@supabase/supabase-js';

// Inicialização segura para não quebrar o build e nem o runtime da Vercel
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL) || '';
  supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
} catch (e) {
  // Se der erro ao tentar ler o import.meta (comum em subpacotes), tenta ler do process.env ou deixa vazio
  console.warn("Variáveis de ambiente do Supabase não encontradas no subpacote.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-se-tiver-vazia.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// O Serviço de Autenticação que o seu Login.tsx usa
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

// Suas funções de negócio de troféus originais intactas
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