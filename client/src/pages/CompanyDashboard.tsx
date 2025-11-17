import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Eye, 
  Plus,
  FileText,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CompanyDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const stats = [
    {
      title: "Vagas Ativas",
      value: "0",
      icon: Briefcase,
      description: "Nenhuma vaga publicada ainda",
      trend: null,
    },
    {
      title: "Candidaturas",
      value: "0",
      icon: Users,
      description: "Total de candidaturas recebidas",
      trend: null,
    },
    {
      title: "Visualizações",
      value: "0",
      icon: Eye,
      description: "Visualizações das suas vagas",
      trend: null,
    },
    {
      title: "Taxa de Conversão",
      value: "0%",
      icon: TrendingUp,
      description: "Candidaturas por visualização",
      trend: null,
    },
  ];

  const handleNewJob = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de criar vagas estará disponível em breve",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleNewJob} data-testid="button-new-job">
          <Plus className="mr-2 h-5 w-5" />
          Nova Vaga
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suas Vagas</CardTitle>
            <CardDescription>
              Gerencie e acompanhe suas vagas publicadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Nenhuma vaga publicada
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Comece publicando sua primeira vaga para atrair os melhores talentos
              </p>
              <Button onClick={handleNewJob} data-testid="button-create-first-job">
                <Plus className="mr-2 h-5 w-5" />
                Publicar Primeira Vaga
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleNewJob}
                data-testid="button-post-job"
              >
                <Plus className="mr-2 h-5 w-5" />
                Publicar Nova Vaga
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setLocation('/empresa/vagas')}
                data-testid="button-view-jobs"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Minhas Vagas
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setLocation('/empresa/perfil')}
                data-testid="button-company-profile"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Perfil da Empresa
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start disabled" 
                disabled
                data-testid="button-reports"
              >
                <FileText className="mr-2 h-5 w-5" />
                Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plano</span>
                <Badge>Gratuito</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vagas Restantes</span>
                <span className="font-medium">Ilimitadas</span>
              </div>
              <Button variant="outline" className="w-full" disabled data-testid="button-upgrade">
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
