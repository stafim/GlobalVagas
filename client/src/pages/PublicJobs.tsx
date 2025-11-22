import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { SaveJobButton } from "@/components/SaveJobButton";
import { 
  MapPin, 
  Briefcase, 
  Clock,
  DollarSign,
  Search,
  Building2,
  Filter,
  X
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import type { Job, GlobalWorkType, GlobalContractType } from "@shared/schema";

interface JobWithCompany extends Job {
  companyName?: string;
  companyLogo?: string;
}

interface Filters {
  workTypes: string[];
  contractTypes: string[];
  companies: string[];
  locations: string[];
}

export default function PublicJobs() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    workTypes: [],
    contractTypes: [],
    companies: [],
    locations: [],
  });

  // Read search query from URL on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const buscaParam = params.get('busca');
    if (buscaParam) {
      setSearchTerm(buscaParam);
    }
  }, [location]);

  const { data: jobs = [], isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/public/jobs'],
  });

  const { data: globalWorkTypes = [] } = useQuery<GlobalWorkType[]>({
    queryKey: ['/api/admin/global-work-types'],
  });

  const { data: globalContractTypes = [] } = useQuery<GlobalContractType[]>({
    queryKey: ['/api/admin/global-contract-types'],
  });

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const companies = new Set<string>();
    const locations = new Set<string>();
    
    jobs.forEach(job => {
      if (job.companyName) companies.add(job.companyName);
      if (job.location) locations.add(job.location);
    });

    return {
      companies: Array.from(companies).sort(),
      locations: Array.from(locations).sort(),
    };
  }, [jobs]);

  const filteredJobs = jobs.filter(job => {
    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search) ||
        job.companyName?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Work type filter
    if (filters.workTypes.length > 0 && job.workType) {
      if (!filters.workTypes.includes(job.workType)) return false;
    }

    // Contract type filter
    if (filters.contractTypes.length > 0 && job.contractType) {
      if (!filters.contractTypes.includes(job.contractType)) return false;
    }

    // Company filter
    if (filters.companies.length > 0 && job.companyName) {
      if (!filters.companies.includes(job.companyName)) return false;
    }

    // Location filter
    if (filters.locations.length > 0 && job.location) {
      if (!filters.locations.includes(job.location)) return false;
    }

    return true;
  });

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [category]: newValues };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      workTypes: [],
      contractTypes: [],
      companies: [],
      locations: [],
    });
  };

  const hasActiveFilters = 
    filters.workTypes.length > 0 ||
    filters.contractTypes.length > 0 ||
    filters.companies.length > 0 ||
    filters.locations.length > 0;

  const formatSalary = (salary: string | null) => {
    if (!salary) return null;
    return `R$ ${parseFloat(salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getWorkTypeLabel = (type: string | null) => {
    if (!type) return null;
    const workType = globalWorkTypes.find(wt => wt.name === type);
    return workType?.name || type;
  };

  const getContractTypeLabel = (type: string | null) => {
    if (!type) return null;
    const contractType = globalContractTypes.find(ct => ct.name === type);
    return contractType?.name || type;
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

          {/* Search Bar and Filter Toggle */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cargo, empresa ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-search-jobs"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto h-12"
              data-testid="button-toggle-filters"
            >
              <Filter className="h-5 w-5 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              {hasActiveFilters && (
                <Badge variant="default" className="ml-2">
                  {filters.workTypes.length + filters.contractTypes.length + filters.companies.length + filters.locations.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            {showFilters && (
              <aside className="lg:w-80 flex-shrink-0">
                <Card className="sticky top-6">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">Filtros</CardTitle>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        data-testid="button-clear-filters"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Work Type Filter */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Tipo de Trabalho</h3>
                      <div className="space-y-2">
                        {globalWorkTypes
                          .filter(wt => wt.isActive === 'true')
                          .map((workType) => (
                          <div key={workType.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`work-${workType.name}`}
                              checked={filters.workTypes.includes(workType.name)}
                              onCheckedChange={() => toggleFilter('workTypes', workType.name)}
                              data-testid={`checkbox-work-${workType.name}`}
                            />
                            <Label htmlFor={`work-${workType.name}`} className="text-sm cursor-pointer">
                              {workType.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Contract Type Filter */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Tipo de Contrato</h3>
                      <div className="space-y-2">
                        {globalContractTypes
                          .filter(ct => ct.isActive === 'true')
                          .map((contractType) => (
                          <div key={contractType.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`contract-${contractType.name}`}
                              checked={filters.contractTypes.includes(contractType.name)}
                              onCheckedChange={() => toggleFilter('contractTypes', contractType.name)}
                              data-testid={`checkbox-contract-${contractType.name}`}
                            />
                            <Label htmlFor={`contract-${contractType.name}`} className="text-sm cursor-pointer">
                              {contractType.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Location Filter */}
                    {filterOptions.locations.length > 0 && (
                      <>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm">Localização</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {filterOptions.locations.map((location) => (
                              <div key={location} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`location-${location}`}
                                  checked={filters.locations.includes(location)}
                                  onCheckedChange={() => toggleFilter('locations', location)}
                                  data-testid={`checkbox-location-${location}`}
                                />
                                <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                                  {location}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Company Filter */}
                    {filterOptions.companies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Empresa</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {filterOptions.companies.map((company) => (
                            <div key={company} className="flex items-center space-x-2">
                              <Checkbox
                                id={`company-${company}`}
                                checked={filters.companies.includes(company)}
                                onCheckedChange={() => toggleFilter('companies', company)}
                                data-testid={`checkbox-company-${company}`}
                              />
                              <Label htmlFor={`company-${company}`} className="text-sm cursor-pointer">
                                {company}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1">
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
                        {job.tags && job.tags.length > 0 && job.tags.map((tag, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
