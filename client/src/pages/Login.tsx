import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao fazer login");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
      setTimeout(() => {
        if (data.userType === "company") {
          setLocation("/dashboard/empresa");
        } else {
          setLocation("/dashboard/operador");
        }
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha e-mail e senha",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-xl p-8">
            <div className="text-center mb-8">
              <img 
                src={operlistLogo} 
                alt="Operlist" 
                className="h-16 mx-auto mb-6"
                data-testid="logo-login"
              />
              <h1 className="font-heading font-bold text-3xl mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-muted-foreground">
                Entre na sua conta para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/recuperar-senha" className="text-sm text-primary hover-elevate px-2 py-1 rounded-md" data-testid="link-forgot-password">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-primary font-medium hover-elevate px-2 py-1 rounded-md" data-testid="link-signup">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ao continuar, você concorda com nossos{" "}
              <Link href="/termos" className="text-primary hover:underline" data-testid="link-terms">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="text-primary hover:underline" data-testid="link-privacy">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
