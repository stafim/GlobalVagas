import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, Lock, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import operlistLogo from "@assets/operlist2025_1763133653351.png";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Step = 'email' | 'code' | 'password';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<'company' | 'operator'>('operator');
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const requestCodeMutation = useMutation({
    mutationFn: async (data: { email: string; userType: string }) => {
      return await apiRequest('POST', '/api/auth/forgot-password', data);
    },
    onSuccess: () => {
      toast({
        title: "Código enviado!",
        description: "Verifique seu e-mail para obter o código de recuperação",
      });
      setStep('code');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar código",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      return await apiRequest('POST', '/api/auth/verify-reset-code', data);
    },
    onSuccess: () => {
      toast({
        title: "Código verificado!",
        description: "Agora você pode criar uma nova senha",
      });
      setStep('password');
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message || "Verifique o código e tente novamente",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; code: string; newPassword: string }) => {
      return await apiRequest('POST', '/api/auth/reset-password', data);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso. Faça login com sua nova senha.",
      });
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu e-mail",
        variant: "destructive",
      });
      return;
    }
    requestCodeMutation.mutate({ email, userType });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 4) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 4 dígitos",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate({ email, code });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas são diferentes",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ email, code, newPassword });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
          <Link href="/login">
            <img 
              src={operlistLogo} 
              alt="Operlist" 
              className="h-12 mb-8 cursor-pointer"
              data-testid="logo-forgot-password"
            />
          </Link>
          <h1 className="font-bold text-4xl mb-3">
            {step === 'email' && 'Recuperar Senha'}
            {step === 'code' && 'Verificar Código'}
            {step === 'password' && 'Nova Senha'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 'email' && 'Digite seu e-mail para receber o código de recuperação'}
            {step === 'code' && 'Digite o código de 4 dígitos enviado para seu e-mail'}
            {step === 'password' && 'Crie uma nova senha para sua conta'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Conta</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'company' | 'operator')}>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover-elevate active-elevate-2">
                  <RadioGroupItem value="operator" id="operator" data-testid="radio-operator" />
                  <Label htmlFor="operator" className="cursor-pointer flex-1">
                    Operador
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover-elevate active-elevate-2">
                  <RadioGroupItem value="company" id="company" data-testid="radio-company" />
                  <Label htmlFor="company" className="cursor-pointer flex-1">
                    Empresa
                  </Label>
                </div>
              </RadioGroup>
            </div>

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

            <Button
              type="submit"
              className="w-full h-11"
              disabled={requestCodeMutation.isPending}
              data-testid="button-send-code"
            >
              {requestCodeMutation.isPending ? "Enviando..." : "Enviar Código"}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <KeyRound className="h-12 w-12 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Código enviado para <strong>{email}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                placeholder="0000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCode(value);
                }}
                maxLength={4}
                className="text-center text-2xl font-bold tracking-widest"
                required
                data-testid="input-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                Digite o código de 4 dígitos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={verifyCodeMutation.isPending || code.length !== 4}
              data-testid="button-verify-code"
            >
              {verifyCodeMutation.isPending ? "Verificando..." : "Verificar Código"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep('email')}
              data-testid="button-back-to-email"
            >
              Voltar
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  data-testid="input-new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={resetPasswordMutation.isPending}
              data-testid="button-reset-password"
            >
              {resetPasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md inline-flex items-center gap-2" data-testid="link-back-to-login">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
