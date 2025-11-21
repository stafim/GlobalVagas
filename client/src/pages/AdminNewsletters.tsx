import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  Users, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { NewsletterSubscription } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminNewsletters() {
  const [, setLocation] = useLocation();
  const { isLoading: authLoading, isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== 'admin')) {
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, userType, setLocation]);

  const { data: subscriptions = [], isLoading } = useQuery<NewsletterSubscription[]>({
    queryKey: ['/api/admin/newsletter-subscriptions'],
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

  // Calculate statistics
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(s => s.isActive === 'true').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySubscriptions = subscriptions.filter(s => {
    const subDate = new Date(s.subscribedAt);
    subDate.setHours(0, 0, 0, 0);
    return subDate.getTime() === today.getTime();
  }).length;

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentSubscriptions = subscriptions.filter(s => {
    const subDate = new Date(s.subscribedAt);
    return subDate >= last7Days;
  }).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl mb-2">
          Newsletter
        </h1>
        <p className="text-muted-foreground">
          Gerencie as inscrições da newsletter
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-subscriptions">
              {totalSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSubscriptions} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inscritos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-subscriptions">
              {todaySubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Últimos 7 Dias
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-week-subscriptions">
              {recentSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Novos inscritos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Ativos
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-rate">
              {totalSubscriptions > 0 
                ? Math.round((activeSubscriptions / totalSubscriptions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Emails ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inscritos ({totalSubscriptions})</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma inscrição ainda
              </h3>
              <p className="text-muted-foreground">
                As inscrições da newsletter aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Data de Inscrição
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr 
                      key={subscription.id} 
                      className="border-b hover-elevate"
                      data-testid={`subscription-row-${subscription.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {subscription.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(
                          new Date(subscription.subscribedAt), 
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {subscription.isActive === 'true' ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
