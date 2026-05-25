import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabase } from "../config/supabase";

export type AuthStateCallback = (user: User | null) => void;

export interface AuthService {
  signUpWithEmail(email: string, password: string): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: AuthStateCallback): { unsubscribe: () => void };
}

const authService: AuthService = {
  async signUpWithEmail(email, password) {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não retornado após o cadastro.");
    return data.user;
  },

  async signInWithEmail(email, password) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não retornado após o login.");
    return data.user;
  },

  async signInWithGoogle() {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await getSupabase().auth.getUser();
    if (error) throw error;
    return data.user ?? null;
  },

  onAuthStateChange(callback: AuthStateCallback) {
    const { data } = getSupabase().auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        callback(session?.user ?? null);
      }
    );
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};

export { authService };