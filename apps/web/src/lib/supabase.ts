import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Inicializa direto no app web onde as variáveis funcionam 100%
export const supabase = createClient(
  url || 'https://placeholder.supabase.co', 
  anonKey || 'placeholder'
);