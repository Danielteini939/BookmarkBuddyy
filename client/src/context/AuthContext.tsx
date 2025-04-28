import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Verificar se estamos em modo de simulação
const SIMULATION_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Em modo de simulação, precisamos de usuários de demonstração
const demoUsers = SIMULATION_MODE ? [
  { email: "admin@exemplo.com", password: "senha123", id: "1" },
  { email: "usuario@teste.com", password: "123456", id: "2" }
] : [];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null, user: User | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Definimos diferentes comportamentos para modo simulação vs real
    if (SIMULATION_MODE) {
      // Modo simulação: Verificar se há um usuário salvo no localStorage
      const savedUser = localStorage.getItem('demoUser');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as User;
          setUser(parsedUser);
          
          // Criar uma sessão simulada
          setSession({ 
            user: parsedUser, 
            access_token: "demo-token", 
            refresh_token: "demo-refresh",
            expires_in: 3600,
            token_type: "bearer"
          } as unknown as Session);
        } catch (e) {
          console.error("Erro ao processar usuário salvo:", e);
          localStorage.removeItem('demoUser');
        }
      }
      
      // Simulação de carregamento
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Modo real: Verificar sessão atual do Supabase
      const fetchSession = async () => {
        setLoading(true);
        
        // Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
        
        // Configurar listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);
          }
        );

        setLoading(false);
        
        // Cleanup
        return () => {
          subscription.unsubscribe();
        };
      };

      fetchSession();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Modo simulação
    if (SIMULATION_MODE) {
      // Verificar se o usuário existe na nossa "base de dados" de demonstração
      const foundUser = demoUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const demoUser = { 
          id: foundUser.id, 
          email: foundUser.email,
          aud: "authenticated",
          role: "authenticated",
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString()
        } as unknown as User;
        
        setUser(demoUser);
        
        // Criar uma sessão simulada completa
        setSession({ 
          user: demoUser, 
          access_token: "demo-token", 
          refresh_token: "demo-refresh",
          expires_in: 3600,
          token_type: "bearer"
        } as unknown as Session);
        
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return { error: null };
      }
      
      return {
        error: { 
          message: "Credenciais inválidas. Tente novamente." 
        } as unknown as AuthError
      };
    } 
    // Modo real
    else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        return { error };
      } catch (err) {
        console.error("Erro ao fazer login:", err);
        return { 
          error: new Error("Ocorreu um erro ao tentar fazer login") as unknown as AuthError
        };
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    // Modo simulação
    if (SIMULATION_MODE) {
      // Verificar se o email já existe
      const userExists = demoUsers.some(u => u.email === email);
      
      if (userExists) {
        return {
          error: {
            message: "Este email já está em uso."
          } as unknown as AuthError,
          user: null
        };
      }
      
      // Criar novo usuário de demonstração
      const newUser = { 
        id: `${demoUsers.length + 1}`, 
        email,
        password,
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString() 
      };
      
      // Adicionar à lista de usuários de demonstração
      demoUsers.push(newUser);
      
      // Retornar versão limpa (sem a senha)
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        aud: newUser.aud,
        role: newUser.role,
        app_metadata: newUser.app_metadata,
        user_metadata: newUser.user_metadata,
        created_at: newUser.created_at
      } as unknown as User;
      
      return { 
        error: null, 
        user: userWithoutPassword 
      };
    } 
    // Modo real
    else {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        
        return { error, user: data?.user || null };
      } catch (err) {
        console.error("Erro ao criar conta:", err);
        return { 
          error: new Error("Ocorreu um erro ao tentar criar a conta") as unknown as AuthError,
          user: null 
        };
      }
    }
  };

  const signInWithGoogle = async () => {
    // Modo simulação
    if (SIMULATION_MODE) {
      // Simular um delay para parecer uma requisição real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar um usuário de demonstração baseado no Google
      const googleUser = {
        id: "google-user-123",
        email: "usuario.google@exemplo.com",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {
          name: "Usuário Google",
          avatar_url: "https://ui-avatars.com/api/?name=Usuário+Google&background=0D8ABC&color=fff"
        },
        created_at: new Date().toISOString()
      } as unknown as User;
      
      setUser(googleUser);
      
      // Criar uma sessão simulada completa
      setSession({ 
        user: googleUser, 
        access_token: "demo-token", 
        refresh_token: "demo-refresh",
        expires_in: 3600,
        token_type: "bearer"
      } as unknown as Session);
      
      localStorage.setItem('demoUser', JSON.stringify(googleUser));
      
      // No modo simulação, não precisamos redirecionar
      // Apenas simulamos o login bem sucedido
      return { error: null };
    }
    // Modo real 
    else {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        return { error };
      } catch (err) {
        console.error("Erro ao fazer login com Google:", err);
        return { 
          error: new Error("Ocorreu um erro ao tentar fazer login com o Google") as unknown as AuthError
        };
      }
    }
  };

  const signOut = async () => {
    if (SIMULATION_MODE) {
      // Remover usuário e sessão do estado
      setUser(null);
      setSession(null);
      
      // Remover do localStorage
      localStorage.removeItem('demoUser');
    } else {
      // Usar o método real do Supabase
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}