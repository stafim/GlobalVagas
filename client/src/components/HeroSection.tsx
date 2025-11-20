import { Search, MapPin, Building2, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Mining_heavy_equipment_scene_02b6e20e.png";
import type { Job } from "@shared/schema";

interface JobWithCompany extends Job {
  companyName?: string;
  companyLogo?: string;
}

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  // Fetch jobs when user types
  const { data: jobs = [], isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/public/jobs'],
    enabled: searchQuery.length > 0,
  });

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return false;
    const search = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.companyName?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search)
    );
  }).slice(0, 5); // Limit to 5 results

  const heroTitle = settingsData?.hero_title || "Encontre Seu Emprego dos Sonhos em Qualquer Lugar do Mundo";
  const heroSubtitle = settingsData?.hero_subtitle || "Mais de 50.000 vagas em 150+ países";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to jobs page with search query
    if (searchQuery.trim()) {
      setLocation(`/vagas?busca=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/vagas');
    }
  };

  const handleJobClick = (jobId: number) => {
    setLocation(`/vaga/${jobId}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  // Show results when user types
  useEffect(() => {
    if (searchQuery.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getWorkTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      'presencial': 'Presencial',
      'remoto': 'Remoto',
      'hibrido': 'Híbrido',
    };
    return type ? labels[type] || type : null;
  };

  return (
    <section className="relative h-[60vh] md:h-[60vh] flex items-center justify-center overflow-visible">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4" data-testid="text-hero-title">
          {heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8" data-testid="text-hero-subtitle">
          {heroSubtitle}
        </p>
        
        <div className="max-w-2xl mx-auto" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 backdrop-blur-md bg-white/10 p-2 rounded-lg border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                <Input
                  type="search"
                  placeholder="Cargo, palavra-chave ou empresa"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white text-foreground border-0"
                  data-testid="input-hero-search"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-clear-hero-search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-12 px-8"
                data-testid="button-hero-search"
              >
                Buscar
              </Button>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="mt-2 max-h-[400px] overflow-y-auto">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Buscando vagas...
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="divide-y">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleJobClick(Number(job.id))}
                        className="p-4 hover-elevate cursor-pointer transition-colors"
                        data-testid={`hero-search-result-${job.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {job.companyLogo ? (
                              <img 
                                src={job.companyLogo} 
                                alt={job.companyName || 'Company'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {job.title}
                            </h4>
                            {job.companyName && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {job.companyName}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              )}
                              {job.workType && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  {getWorkTypeLabel(job.workType)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => setLocation(`/vagas?busca=${encodeURIComponent(searchQuery)}`)}
                      className="p-3 text-center text-sm text-primary hover:bg-accent cursor-pointer font-medium"
                      data-testid="hero-search-view-all"
                    >
                      Ver todas as {filteredJobs.length < jobs.length ? 'vagas' : `${jobs.length} vagas`} →
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma vaga encontrada para "{searchQuery}"
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setLocation('/vagas')}
                      className="mt-2"
                      data-testid="hero-search-browse-all"
                    >
                      Ver todas as vagas disponíveis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
