import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Users, 
  Building2,
  HardHat,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LoginHistoryUser {
  id: string;
  name: string;
  email: string;
  type: 'company' | 'operator';
  lastLoginAt: string | null;
}

export default function AdminLoginHistory() {
  const [, setLocation] = useLocation();
  const { isLoading: authLoading, isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== 'admin')) {
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, userType, setLocation]);

  const { data, isLoading } = useQuery<{ users: LoginHistoryUser[]; total: number }>({
    queryKey: ['/api/users/login-history'],
    enabled: isAuthenticated && userType === 'admin',
  });

  if (authLoading || isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'admin') {
    return null;
  }

  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  
  const companies = users.filter(u => u.type === 'company');
  const operators = users.filter(u => u.type === 'operator');
  
  const usersWithLogin = users.filter(u => u.lastLoginAt !== null);
  const usersWithoutLogin = users.filter(u => u.lastLoginAt === null);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentLogins = users.filter(u => {
    if (!u.lastLoginAt) return false;
    const loginDate = new Date(u.lastLoginAt);
    return loginDate >= last7Days;
  }).length;

  const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) {
      return <Badge variant="secondary">Nunca logou</Badge>;
    }
    
    const loginDate = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    let timeAgo = '';
    if (diffInHours < 1) {
      timeAgo = 'Há menos de 1 hora';
    } else if (diffInHours < 24) {
      timeAgo = `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays < 7) {
      timeAgo = `Há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
    } else {
      timeAgo = format(loginDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
    
    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{timeAgo}</span>
        <span className="text-xs text-muted-foreground">
          {format(loginDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </span>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl mb-2">
          Histórico de Logins
        </h1>
        <p className="text-muted-foreground">
          Visualize quando cada cliente e operador fez login pela última vez
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {companies.length} empresas, {operators.length} operadores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Com Login
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-users-with-login">
              {usersWithLogin.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((usersWithLogin.length / totalUsers) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sem Login
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-users-without-login">
              {usersWithoutLogin.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nunca acessaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Últimos 7 Dias
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-recent-logins">
              {recentLogins}
            </div>
            <p className="text-xs text-muted-foreground">
              Logins recentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Logins por Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Último Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium" data-testid={`text-name-${user.id}`}>
                      {user.name}
                    </TableCell>
                    <TableCell data-testid={`text-email-${user.id}`}>
                      {user.email}
                    </TableCell>
                    <TableCell data-testid={`badge-type-${user.id}`}>
                      {user.type === 'company' ? (
                        <Badge variant="default" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          Empresa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <HardHat className="h-3 w-3" />
                          Operador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-last-login-${user.id}`}>
                      {formatLastLogin(user.lastLoginAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
