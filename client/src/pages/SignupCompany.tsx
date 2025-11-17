import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema } from "@shared/schema";
import type { InsertCompany } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, Mail, Lock, Phone, Globe, FileText, Users } from "lucide-react";

const signupFormSchema = insertCompanySchema.extend({
  confirmPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupCompany() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      cnpj: "",
      phone: "",
      website: undefined,
      description: undefined,
      industry: undefined,
      size: undefined,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      const response = await fetch("/api/companies/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar conta");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => {
        setLocation("/dashboard/empresa");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, ...companyData } = data;
    registerMutation.mutate(companyData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading font-bold text-3xl mb-2">
                Cadastro de Empresa
              </h1>
              <p className="text-muted-foreground">
                Preencha os dados da sua empresa para começar
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg">Informações da Empresa</h2>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Sua Empresa Ltda"
                              className="pl-10"
                              data-testid="input-company-name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="00.000.000/0000-00"
                              className="pl-10"
                              data-testid="input-cnpj"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-industry">
                                <SelectValue placeholder="Selecione o setor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mineracao">Mineração</SelectItem>
                              <SelectItem value="construcao">Construção Civil</SelectItem>
                              <SelectItem value="industria">Indústria</SelectItem>
                              <SelectItem value="agricultura">Agricultura</SelectItem>
                              <SelectItem value="logistica">Logística</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-size">
                                <SelectValue placeholder="Nº de funcionários" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-500">201-500</SelectItem>
                              <SelectItem value="500+">500+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte um pouco sobre sua empresa..."
                            className="resize-none"
                            rows={3}
                            data-testid="input-description"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="font-semibold text-lg">Informações de Contato</h2>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail Corporativo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="contato@empresa.com"
                              className="pl-10"
                              data-testid="input-email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="(00) 0000-0000"
                              className="pl-10"
                              data-testid="input-phone"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="https://www.empresa.com"
                              className="pl-10"
                              data-testid="input-website"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="font-semibold text-lg">Segurança</h2>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              data-testid="input-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <a
                  href="/login"
                  className="text-primary font-medium hover-elevate px-2 py-1 rounded-md"
                  data-testid="link-login"
                >
                  Faça login
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
