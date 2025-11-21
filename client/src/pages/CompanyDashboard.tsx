import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Eye, 
  Plus,
  FileText,
  TrendingUp,
  MapPin,
  Clock,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Job } from "@shared/schema";

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

  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const stats = [
    {
      title: "Vagas Ativas",
      value: statsData?.activeJobs?.toString() || "0",
      icon: Briefcase,
      description: statsData && statsData.activeJobs > 0 ? `${statsData.totalJobs - statsData.activeJobs} suspensas` : "Nenhuma vaga publicada ainda",
      trend: null,
    },
    {
      title: "Candidaturas",
      value: statsData?.totalApplications?.toString() || "0",
      icon: Users,
      description: statsData && statsData.recentApplications > 0 ? `+${statsData.recentApplications} nos últimos 7 dias` : "Total de candidaturas recebidas",
      trend: statsData && statsData.recentApplications > 0 ? `+${statsData.recentApplications}` : null,
    },
    {
      title: "Total de Vagas",
      value: statsData?.totalJobs?.toString() || "0",
      icon: FileText,
      description: "Vagas publicadas (ativas e suspensas)",
      trend: null,
    },
    {
      title: "Média por Vaga",
      value: statsData && statsData.totalJobs > 0 ? Math.round(statsData.totalApplications / statsData.totalJobs).toString() : "0",
      icon: TrendingUp,
      description: "Candidaturas por vaga em média",
      trend: null,
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
            className="hover-elevate"
            data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-muted-foreground" />
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Suas Vagas</CardTitle>
              <CardDescription>
                Últimas vagas publicadas
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setLocation('/empresa/vagas')}
              data-testid="button-view-all-jobs"
            >
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingJobs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
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
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job, index) => (
                  <div key={job.id}>
                    <div 
                      className="flex items-start gap-4 p-4 rounded-lg hover-elevate cursor-pointer transition-all"
                      onClick={() => setLocation(`/vaga/${job.id}`)}
                      data-testid={`job-summary-${index}`}
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{job.title}</h4>
                          <Badge 
                            variant={job.status === 'active' ? 'default' : 'secondary'}
                            className="flex-shrink-0"
                          >
                            {job.status === 'active' ? '● Ativa' : '⏸ Suspensa'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(job.createdAt).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < Math.min(jobs.length - 1, 2) && <Separator className="my-3" />}
                  </div>
                ))}
                {jobs.length > 3 && (
                  <div className="pt-2">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setLocation('/empresa/vagas')}
                      data-testid="button-see-more-jobs"
                    >
                      Ver mais {jobs.length - 3} vagas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
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
