import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SaveJobButton } from "@/components/SaveJobButton";
import { 
  ArrowLeft,
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Briefcase
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import type { SavedJob, Job } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JobWithCompany extends Job {
  companyName?: string;
  companyLogo?: string;
}

export default function SavedJobs() {
  const [, setLocation] = useLocation();
  const { isLoading: authLoading, isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== 'operator')) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, userType, setLocation]);

  const { data: savedJobs = [], isLoading } = useQuery<Array<SavedJob & { job: JobWithCompany }>>({
    queryKey: ['/api/operator/saved-jobs'],
    enabled: isAuthenticated && userType === 'operator',
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'operator') {
    return null;
  }

  const getWorkTypeLabel = (workType: string) => {
    const labels: Record<string, string> = {
      'presencial': 'Presencial',
      'remoto': 'Remoto',
      'hibrido': 'Híbrido',
    };
    return labels[workType] || workType;
  };

  const getContractTypeLabel = (contractType: string) => {
    const labels: Record<string, string> = {
      'clt': 'CLT',
      'pj': 'PJ',
      'estagio': 'Estágio',
      'temporario': 'Temporário',
    };
    return labels[contractType] || contractType;
  };

  const formatSalary = (salary: string) => {
    if (!salary) return '';
    
    // Se já está formatado, retornar
    if (salary.includes('R$')) return salary;
    
    // Tentar formatar número
    const num = parseFloat(salary);
    if (!isNaN(num)) {
      return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return salary;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard/operador")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="font-heading font-bold text-3xl">
                Vagas Salvas
              </h1>
            </div>
            <p className="text-muted-foreground">
              {savedJobs.length === 0 
                ? 'Você ainda não salvou nenhuma vaga'
                : `${savedJobs.length} ${savedJobs.length === 1 ? 'vaga salva' : 'vagas salvas'}`
              }
            </p>
          </div>

          {savedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma vaga salva ainda
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Explore as vagas disponíveis e salve aquelas que chamarem sua atenção clicando no ícone de bookmark
                </p>
                <Button onClick={() => setLocation("/vagas")} data-testid="button-browse-jobs">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Explorar Vagas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedJobs.map((savedJob) => {
                const job = savedJob.job;
                
                return (
                  <Card 
                    key={savedJob.id} 
                    className="overflow-hidden hover-elevate cursor-pointer transition-all group"
                    onClick={() => setLocation(`/vaga/${job.id}`)}
                    data-testid={`saved-job-card-${job.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Company Info */}
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {job.companyLogo ? (
                              <img 
                                src={job.companyLogo} 
                                alt={job.companyName || 'Company'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            {job.companyName && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {job.companyName}
                              </p>
                            )}
                          </div>
                          <SaveJobButton jobId={job.id} />
                        </div>

                        {/* Description */}
                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {job.description}
                          </p>
                        )}

                        {/* Job Details */}
                        <div className="space-y-2">
                          {job.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-1">{job.location}</span>
                            </div>
                          )}
                          
                          {job.salary && (
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                              <DollarSign className="h-4 w-4 flex-shrink-0" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Salva em {format(new Date(savedJob.savedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {job.workType && (
                            <Badge variant="secondary" className="text-xs">
                              {getWorkTypeLabel(job.workType)}
                            </Badge>
                          )}
                          {job.contractType && (
                            <Badge variant="outline" className="text-xs">
                              {getContractTypeLabel(job.contractType)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
