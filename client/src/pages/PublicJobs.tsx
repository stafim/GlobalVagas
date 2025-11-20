import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { 
  MapPin, 
  Briefcase, 
  Clock,
  DollarSign,
  Search,
  Building2
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import type { Job } from "@shared/schema";

interface JobWithCompany extends Job {
  companyName?: string;
  companyLogo?: string;
}

export default function PublicJobs() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs = [], isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/public/jobs'],
  });

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.companyName?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search)
    );
  });

  const formatSalary = (salary: string | null) => {
    if (!salary) return null;
    return `R$ ${parseFloat(salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getWorkTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'presencial': 'Presencial',
      'remoto': 'Remoto',
      'hibrido': 'Híbrido',
    };
    return type ? labels[type] || type : null;
  };

  const getContractTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'clt': 'CLT',
      'pj': 'PJ',
      'estagio': 'Estágio',
      'temporario': 'Temporário',
    };
    return type ? labels[type] || type : null;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Vagas Disponíveis</h1>
            <p className="text-muted-foreground text-lg">
              Explore oportunidades de trabalho nas melhores empresas
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cargo, empresa ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-search-jobs"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <span>Carregando vagas...</span>
              ) : (
                <span>
                  <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                </span>
              )}
            </p>
          </div>

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga disponível'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? 'Tente ajustar sua busca ou limpar os filtros' 
                    : 'No momento não há vagas publicadas. Volte em breve!'}
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} data-testid="button-clear-search">
                    Limpar Busca
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="overflow-hidden hover-elevate cursor-pointer transition-all group"
                  onClick={() => setLocation(`/vaga/${job.id}`)}
                  data-testid={`job-card-${job.id}`}
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
                            {new Date(job.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
