import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Briefcase, Activity, Eye, TrendingUp, Clock, BarChart3, Award, Search, CreditCard, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LiveStats {
  totalCompanies: number;
  totalOperators: number;
  totalJobs: number;
  activeJobs: number;
  suspendedJobs: number;
  totalVisits: number;
  todayVisits: number;
  recentLogins: Array<{
    id: number;
    userId: string;
    userType: string;
    loginDate: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  companiesWithLastLogin: Array<{
    id: string;
    companyName: string;
    email: string;
    lastLogin?: string;
  }>;
  companiesJobsRanking: Array<{
    companyId: string;
    companyName: string;
    totalJobs: number;
    activeJobs: number;
  }>;
}

interface CompanySummary {
  company: {
    id: string;
    companyName: string;
    email: string;
    cnpj: string | null;
    industry: string | null;
    companySize: string | null;
    lastLoginAt: string | null;
    createdAt: string;
  };
  stats: {
    totalJobs: number;
    activeJobs: number;
    suspendedJobs: number;
    totalPurchases: number;
    availableCredits: number;
  };
  purchases: Array<{
    id: string;
    planName: string;
    credits: number;
    usedCredits: number;
    price: number;
    status: string;
    purchaseDate: string;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    viewCount: number;
  }>;
}

export default function AdminLiveDashboard() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: stats, isLoading } = useQuery<LiveStats>({
    queryKey: ['/api/admin/live-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: companySummary, isLoading: isLoadingSummary } = useQuery<CompanySummary>({
    queryKey: ['/api/admin/company-summary', selectedCompanyId],
    enabled: !!selectedCompanyId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'company':
        return 'Empresa';
      case 'operator':
        return 'Operador';
      case 'admin':
        return 'Admin';
      default:
        return userType;
    }
  };

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'company':
        return 'default';
      case 'operator':
        return 'secondary';
      case 'admin':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-red-500" />
            AO VIVO
          </h1>
          <p className="text-muted-foreground">Estatísticas em tempo real da plataforma</p>
        </div>
        <Badge variant="outline" className="text-red-500 border-red-500">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Atualização automática
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-companies">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-companies">
              {stats?.totalCompanies || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-operators">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Operadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-operators">
              {stats?.totalOperators || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Operadores registrados</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-jobs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Totais</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-jobs">
              {stats?.totalJobs || 0}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs" data-testid="badge-active-jobs">
                {stats?.activeJobs || 0} Ativas
              </Badge>
              <Badge variant="secondary" className="text-xs" data-testid="badge-suspended-jobs">
                {stats?.suspendedJobs || 0} Suspensas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Link href="/admin/visitas">
          <Card data-testid="card-total-visits" className="hover-elevate cursor-pointer transition-all">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas ao Site</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-visits">
                {stats?.totalVisits || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.todayVisits || 0} visitas hoje
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Company Search Section */}
      <Card data-testid="card-company-search">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Buscar Cliente
          </CardTitle>
          <CardDescription>Selecione uma empresa para ver informações detalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                data-testid="button-company-search"
              >
                {selectedCompanyId
                  ? stats?.companiesWithLastLogin.find((company) => company.id === selectedCompanyId)?.companyName
                  : "Selecione uma empresa..."}
                <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Buscar empresa..." data-testid="input-company-search" />
                <CommandList>
                  <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                  <CommandGroup>
                    {stats?.companiesWithLastLogin.map((company) => (
                      <CommandItem
                        key={company.id}
                        value={company.companyName}
                        onSelect={() => {
                          setSelectedCompanyId(company.id);
                          setOpen(false);
                        }}
                        data-testid={`item-company-${company.id}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{company.companyName}</span>
                          <span className="text-xs text-muted-foreground">{company.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Company Summary */}
      {selectedCompanyId && companySummary && (
        <div className="space-y-4" data-testid="section-company-summary">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                {companySummary.company.companyName}
              </CardTitle>
              <CardDescription>{companySummary.company.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium" data-testid="text-cnpj">
                    {companySummary.company.cnpj || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="font-medium" data-testid="text-industry">
                    {companySummary.company.industry || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamanho</p>
                  <p className="font-medium" data-testid="text-company-size">
                    {companySummary.company.companySize || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último Acesso</p>
                  <p className="font-medium" data-testid="text-last-access">
                    {companySummary.company.lastLoginAt
                      ? format(new Date(companySummary.company.lastLoginAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : 'Nunca acessou'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vagas Totais</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-summary-total-jobs">
                  {companySummary.stats.totalJobs}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="default" className="text-xs">
                    {companySummary.stats.activeJobs} Ativas
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {companySummary.stats.suspendedJobs} Suspensas
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-summary-credits">
                  {companySummary.stats.availableCredits}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {companySummary.stats.totalPurchases} {companySummary.stats.totalPurchases === 1 ? 'plano' : 'planos'} comprados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-summary-purchases">
                  {companySummary.stats.totalPurchases}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Planos adquiridos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membro Desde</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold" data-testid="text-summary-member-since">
                  {format(new Date(companySummary.company.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Data de cadastro</p>
              </CardContent>
            </Card>
          </div>

          {/* Purchases */}
          {companySummary.purchases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Compras de Planos
                </CardTitle>
                <CardDescription>Histórico de compras de créditos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companySummary.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      data-testid={`purchase-${purchase.id}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{purchase.planName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(purchase.purchaseDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {purchase.credits - purchase.usedCredits} / {purchase.credits} créditos
                          </p>
                          <p className="text-xs text-muted-foreground">
                            R$ {purchase.price.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={purchase.status === 'Disponível para uso' ? 'default' : 'secondary'}>
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Jobs */}
          {companySummary.recentJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  Vagas Recentes
                </CardTitle>
                <CardDescription>Últimas 5 vagas cadastradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companySummary.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      data-testid={`job-${job.id}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada em {format(new Date(job.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {job.viewCount} {job.viewCount === 1 ? 'visualização' : 'visualizações'}
                          </p>
                        </div>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status === 'active' ? 'Ativa' : 'Suspensa'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading state for company summary */}
      {selectedCompanyId && isLoadingSummary && (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Logins */}
      <Card data-testid="card-recent-logins">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Últimos Acessos
          </CardTitle>
          <CardDescription>10 logins mais recentes na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.recentLogins && stats.recentLogins.length > 0 ? (
              stats.recentLogins.map((login) => (
                <div
                  key={login.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                  data-testid={`login-${login.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getUserTypeBadgeVariant(login.userType)}>
                      {getUserTypeLabel(login.userType)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium" data-testid={`text-login-date-${login.id}`}>
                        {format(new Date(login.loginDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {login.ipAddress && (
                        <p className="text-xs text-muted-foreground">IP: {login.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum login registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Companies Jobs Ranking */}
      <Card data-testid="card-companies-jobs-ranking">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Ranking de Vagas por Empresa
          </CardTitle>
          <CardDescription>Top 10 clientes que mais abriram vagas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.companiesJobsRanking && stats.companiesJobsRanking.length > 0 ? (
              stats.companiesJobsRanking.map((company, index) => {
                const maxJobs = stats.companiesJobsRanking[0]?.totalJobs || 1;
                const percentage = (company.totalJobs / maxJobs) * 100;
                
                return (
                  <div
                    key={company.companyId}
                    className="space-y-2"
                    data-testid={`ranking-${company.companyId}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                          {index === 1 && <Award className="h-4 w-4 text-gray-400" />}
                          {index === 2 && <Award className="h-4 w-4 text-orange-600" />}
                          {index > 2 && <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" data-testid={`text-company-ranking-${company.companyId}`}>
                            {company.companyName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" className="text-xs">
                              {company.totalJobs} {company.totalJobs === 1 ? 'vaga' : 'vagas'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {company.activeJobs} {company.activeJobs === 1 ? 'ativa' : 'ativas'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                        data-testid={`progress-${company.companyId}`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma vaga cadastrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Companies with Last Login */}
      <Card data-testid="card-companies-last-login">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Empresas - Último Acesso
          </CardTitle>
          <CardDescription>20 empresas mais ativas recentemente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.companiesWithLastLogin && stats.companiesWithLastLogin.length > 0 ? (
              stats.companiesWithLastLogin.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                  data-testid={`company-${company.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" data-testid={`text-company-name-${company.id}`}>
                      {company.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">{company.email}</p>
                  </div>
                  <div className="text-right">
                    {company.lastLogin ? (
                      <p className="text-sm" data-testid={`text-last-login-${company.id}`}>
                        {format(new Date(company.lastLogin), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Nunca acessou</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma empresa cadastrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
