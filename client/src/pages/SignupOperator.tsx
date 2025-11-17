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
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOperatorSchema } from "@shared/schema";
import type { InsertOperator } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HardHat, Mail, Lock, Phone, User, FileText, Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

function removeCPFMask(value: string): string {
  return value.replace(/\D/g, '');
}

function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
}

const signupFormSchema = insertOperatorSchema.extend({
  confirmPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .refine((cpf) => validateCPF(cpf), {
      message: "CPF inválido",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupOperator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      cpf: "",
      phone: "",
      birthDate: undefined,
      profession: "",
      experienceYears: undefined,
      certifications: undefined,
      availability: undefined,
      preferredLocation: undefined,
      workType: undefined,
      skills: undefined,
      bio: undefined,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertOperator) => {
      const response = await fetch("/api/operators/register", {
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
        description: "Redirecionando para seu dashboard...",
      });
      setTimeout(() => {
        setLocation("/dashboard/operador");
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

  const onSubmit = async (data: SignupFormData) => {
    if (currentStep !== 2) {
      return;
    }
    
    const { confirmPassword, ...operatorData } = data;
    registerMutation.mutate(operatorData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      form.handleSubmit(onSubmit)();
    }
  };

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["fullName", "email", "phone", "cpf", "password", "confirmPassword"];
    } else if (step === 2) {
      fieldsToValidate = ["profession"];
    }
    
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: "Informações Pessoais" },
    { number: 2, title: "Informações Profissionais" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-2">
              Cadastro de Operador
            </h1>
            <p className="text-muted-foreground">
              Preencha seus dados em 2 etapas simples
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors ${
                        currentStep > step.number
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="text-xs text-center hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-colors ${
                        currentStep > step.number ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8">
            <Form {...form}>
              <form 
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold text-lg mb-4">Etapa 1: Informações Pessoais</h2>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Seu nome completo"
                                className="pl-10"
                                data-testid="input-full-name"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="seu@email.com"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  placeholder="(00) 00000-0000"
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
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  placeholder="000.000.000-00"
                                  className="pl-10"
                                  data-testid="input-cpf"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCPF(e.target.value);
                                    field.onChange(removeCPFMask(formatted));
                                    e.target.value = formatted;
                                  }}
                                  value={formatCPF(field.value || '')}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              data-testid="input-birth-date"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold text-lg mb-4">Etapa 2: Informações Profissionais</h2>

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão/Especialidade</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Ex: Operador de Escavadeira, Motorista, etc"
                                className="pl-10"
                                data-testid="input-profession"
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
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Experiência (Opcional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-experience">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-1">Menos de 1 ano</SelectItem>
                              <SelectItem value="1-3">1-3 anos</SelectItem>
                              <SelectItem value="3-5">3-5 anos</SelectItem>
                              <SelectItem value="5-10">5-10 anos</SelectItem>
                              <SelectItem value="10+">Mais de 10 anos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificações (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste suas certificações e cursos relevantes..."
                              className="resize-none"
                              rows={3}
                              data-testid="input-certifications"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habilidades (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva suas principais habilidades técnicas..."
                              className="resize-none"
                              rows={3}
                              data-testid="input-skills"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      data-testid="button-previous"
                    >
                      Voltar
                    </Button>
                  )}
                  
                  <div className="ml-auto">
                    {currentStep < 2 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        data-testid="button-next"
                      >
                        Próxima Etapa
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </Card>

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
      </main>

      <Footer />
    </div>
  );
}
