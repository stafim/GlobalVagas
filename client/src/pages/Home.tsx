import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Building2, Clock, DollarSign, Briefcase, ArrowRight } from "lucide-react";
import type { Job } from "@shared/schema";

interface JobWithCompany extends Job {
  companyName?: string;
  companyLogo?: string;
}

export default function Home() {
  const [language, setLanguage] = useState("PT");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Track visit to home page
    const trackVisit = async () => {
      try {
        await apiRequest("POST", "/api/track-visit", {});
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.log("Visit tracking failed:", error);
      }
    };
    trackVisit();
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(language === "PT" ? "EN" : "PT");
    console.log("Language switched to:", language === "PT" ? "EN" : "PT");
  };

  // Fetch latest jobs
  const { data: jobs = [], isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/public/jobs'],
  });

  // Get latest 6 jobs
  const latestJobs = jobs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

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
    <div className="min-h-screen flex flex-col">
      <Header onLanguageToggle={handleLanguageToggle} language={language} />
      <HeroSection />
      <StatsSection />
      
      <main className="flex-1">
        <CategorySection />
        
        {/* Latest Jobs Section */}
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading font-bold text-3xl mb-2">
                  Últimas Vagas Cadastradas
                </h2>
                <p className="text-muted-foreground">
                  Confira as oportunidades mais recentes publicadas pelas empresas
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-16 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestJobs.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhuma vaga disponível
                  </h3>
                  <p className="text-muted-foreground">
                    No momento não há vagas cadastradas. Volte em breve!
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {latestJobs.map((job) => (
                    <Card 
                      key={job.id}
                      className="hover-elevate cursor-pointer transition-all"
                      onClick={() => setLocation(`/vaga/${job.id}`)}
                      data-testid={`home-job-card-${job.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
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
                            <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                              {job.title}
                            </h3>
                            {job.companyName && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                                {job.companyName}
                              </p>
                            )}
                            
                            {job.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {job.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mb-3">
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
                              {job.salary && (
                                <Badge variant="outline" className="text-xs font-semibold text-green-600 dark:text-green-400">
                                  {formatSalary(job.salary)}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {job.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="line-clamp-1">{job.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(job.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Ver Mais Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={() => setLocation('/vagas')}
                    className="gap-2"
                    data-testid="button-view-all-jobs"
                  >
                    Ver Mais Vagas
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
