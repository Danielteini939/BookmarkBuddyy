import { createClient } from "@supabase/supabase-js";

// Usando valores de demonstração temporários (simulação)
// Em produção, use as variáveis de ambiente adequadas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://demo-supabase-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "demo-anon-key";

// Verificar se as variáveis reais estão definidas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Variáveis de ambiente do Supabase não estão configuradas corretamente.");
  console.warn("Por favor, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  console.warn("Usando modo de simulação para demonstração.");
}

// Criar cliente Supabase (se estamos em modo de simulação, este objeto 
// será usado apenas para tipagem, mas o AuthContext usará uma implementação simulada)
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