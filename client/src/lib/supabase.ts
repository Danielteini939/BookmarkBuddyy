import { createClient } from "@supabase/supabase-js";

// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente do Supabase não estão configuradas corretamente.");
  console.error("Por favor, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  throw new Error("Configuração do Supabase incompleta");
}

// Criar cliente Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);