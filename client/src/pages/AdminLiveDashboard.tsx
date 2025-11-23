import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Activity, Eye, TrendingUp, Clock, BarChart3, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

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

export default function AdminLiveDashboard() {
  const { data: stats, isLoading } = useQuery<LiveStats>({
    queryKey: ['/api/admin/live-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
