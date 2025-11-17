import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Building2, HardHat, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<"company" | "operator" | null>(null);

  const handleSelectType = (type: "company" | "operator") => {
    setSelectedType(type);
    console.log("User type selected:", type);
    setTimeout(() => {
      setLocation(`/cadastro/${type}`);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl mb-4">
              Bem-vindo ao Operlist
            </h1>
            <p className="text-lg text-muted-foreground">
              Escolha o tipo de conta que deseja criar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
              onClick={() => handleSelectType("company")}
              data-testid="card-signup-company"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-heading font-bold text-2xl">
                    Sou Empresa
                  </h2>
                  <p className="text-muted-foreground">
                    Publique vagas e encontre os melhores profissionais para sua equipe
                  </p>
                </div>

                <ul className="text-sm text-muted-foreground space-y-2 text-left w-full">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Publique vagas ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Acesse banco de talentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Gerencie candidaturas</span>
                  </li>
                </ul>

                <div className="pt-4 w-full">
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <span>Criar conta empresa</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Card>

            <Card
              className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
              onClick={() => handleSelectType("operator")}
              data-testid="card-signup-operator"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <HardHat className="w-12 h-12 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-heading font-bold text-2xl">
                    Sou Operador
                  </h2>
                  <p className="text-muted-foreground">
                    Encontre oportunidades em todo o mundo e impulsione sua carreira
                  </p>
                </div>

                <ul className="text-sm text-muted-foreground space-y-2 text-left w-full">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Acesse milhares de vagas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Candidate-se com 1 clique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Receba alertas de vagas</span>
                  </li>
                </ul>

                <div className="pt-4 w-full">
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <span>Criar conta operador</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
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
