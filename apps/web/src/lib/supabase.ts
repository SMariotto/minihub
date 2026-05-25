import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cria e exporta o cliente real do Supabase
export const supabase = createClient(url, anonKey);