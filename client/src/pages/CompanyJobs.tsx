import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Search, MapPin, Clock, DollarSign, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CompanyJobs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewJob = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de criar vagas estará disponível em breve",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vagas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
        <Button onClick={handleNewJob} data-testid="button-new-job">
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vagas Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-jobs">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vagas publicadas atualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidaturas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-applications">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de candidaturas recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vagas Fechadas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-closed-jobs">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vagas finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Vagas</CardTitle>
          <CardDescription>
            Gerencie e acompanhe suas vagas publicadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Briefcase className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Nenhuma vaga publicada
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Comece publicando sua primeira vaga para atrair os melhores profissionais do setor
            </p>
            <Button onClick={handleNewJob} data-testid="button-create-first-job">
              <Plus className="mr-2 h-5 w-5" />
              Publicar Primeira Vaga
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
