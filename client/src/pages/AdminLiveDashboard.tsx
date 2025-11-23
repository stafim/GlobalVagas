import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Activity, Eye, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LiveStats {
  totalCompanies: number;
  totalOperators: number;
  totalJobs: number;
  activeJobs: number;
  suspendedJobs: number;
  totalVisits: number;
  uniqueVisits: number;
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

        <Card data-testid="card-total-visits">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas ao Site</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-visits">
              {stats?.totalVisits || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.uniqueVisits || 0} visitantes únicos
            </p>
          </CardContent>
        </Card>
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
