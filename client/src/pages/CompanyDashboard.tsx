import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  recentApplications: number;
}

export default function CompanyDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: statsData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/companies/dashboard-stats'],
  });

  const stats = [
    {
      title: "Vagas Ativas",
      value: statsData?.activeJobs?.toString() || "0",
      icon: Briefcase,
      description: statsData && statsData.activeJobs > 0 ? `${statsData.totalJobs - statsData.activeJobs} suspensas` : "Nenhuma vaga publicada ainda",
      trend: null,
      gradient: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgIcon: "bg-blue-500/10",
    },
    {
      title: "Candidaturas",
      value: statsData?.totalApplications?.toString() || "0",
      icon: Users,
      description: statsData && statsData.recentApplications > 0 ? `+${statsData.recentApplications} nos últimos 7 dias` : "Total de candidaturas recebidas",
      trend: statsData && statsData.recentApplications > 0 ? `+${statsData.recentApplications}` : null,
      gradient: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-600 dark:text-green-400",
      bgIcon: "bg-green-500/10",
    },
    {
      title: "Total de Vagas",
      value: statsData?.totalJobs?.toString() || "0",
      icon: FileText,
      description: "Vagas publicadas (ativas e suspensas)",
      trend: null,
      gradient: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgIcon: "bg-purple-500/10",
    },
    {
      title: "Média por Vaga",
      value: statsData && statsData.totalJobs > 0 ? Math.round(statsData.totalApplications / statsData.totalJobs).toString() : "0",
      icon: TrendingUp,
      description: "Candidaturas por vaga em média",
      trend: null,
      gradient: "from-orange-500/10 to-orange-600/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgIcon: "bg-orange-500/10",
    },
  ];

  const handleNewJob = () => {
    setLocation('/empresa/vagas');
  };

  if (isLoading) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={`hover-elevate bg-gradient-to-br ${stat.gradient} border-none`}
            data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bgIcon} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="font-semibold">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
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
      </div>
    </>
  );
}
