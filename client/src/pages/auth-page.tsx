import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, signIn, loading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar para home se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o Dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Formulário - Lado Esquerdo */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">LoanBuddy</h1>
            <p className="text-muted-foreground">
              Gerencie seus empréstimos de forma simples e eficiente
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>O cadastro de usuários é realizado pelo administrador do sistema.</p>
          </div>
        </Card>
      </div>

      {/* Hero - Lado Direito */}
      <div
        className="hidden md:flex md:w-1/2 bg-primary items-center justify-center"
      >
        <div className="max-w-md p-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Gerencie seus empréstimos com facilidade
          </h2>
          <p className="text-white text-xl opacity-90 mb-6">
            Uma forma simples e organizada de controlar empréstimos pessoais, 
            acompanhar pagamentos e gerar relatórios detalhados.
          </p>
          <ul className="space-y-3 text-white opacity-90 text-left">
            <li className="flex items-center">
              <span className="mr-2">✓</span> Controle de mutuários e empréstimos
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Gestão de pagamentos e parcelas
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Notificações de vencimentos
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Relatórios financeiros detalhados
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}