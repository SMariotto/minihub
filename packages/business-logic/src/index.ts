// O Serviço de Autenticação apenas encapsula as funções sem iniciar o cliente aqui
export const authService = {
  getSupabase(client: any) {
    return client;
  },
  async loginWithEmail(supabaseClient: any, email: string) {
    return await supabaseClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
  },
  async loginWithGoogle(supabaseClient: any) {
    return await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  },
  async logout(supabaseClient: any) {
    return await supabaseClient.auth.signOut();
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