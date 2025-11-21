import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, HardHat, Users, Eye, Globe, MapPin } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { Company, Operator, SiteVisit } from "@shared/schema";

export default function AdminDashboard() {
  const { userType } = useAuth();
  const [visitsDialogOpen, setVisitsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery<{
    companies: Company[];
    operators: Operator[];
    total: { companies: number; operators: number };
  }>({
    queryKey: ['/api/users/list'],
    enabled: userType === 'admin',
    retry: false,
  });

  const { data: visitStats, isLoading: isLoadingVisits } = useQuery<{
    totalVisits: number;
    todayVisits: number;
  }>({
    queryKey: ['/api/admin/visit-stats'],
    enabled: userType === 'admin',
    retry: false,
  });

  const { data: siteVisits, isLoading: isLoadingSiteVisits } = useQuery<SiteVisit[]>({
    queryKey: ['/api/admin/site-visits'],
    enabled: userType === 'admin' && visitsDialogOpen,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (data?.total.companies || 0) + (data?.total.operators || 0)
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-companies">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  data?.total.companies || 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Operadores
              </CardTitle>
              <HardHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-operators">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  data?.total.operators || 0
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={visitsDialogOpen} onOpenChange={setVisitsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="card-site-visits">
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Visitas ao Site
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-visits">
                    {isLoadingVisits ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      visitStats?.totalVisits || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoadingVisits ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      `${visitStats?.todayVisits || 0} hoje • Clique para ver detalhes`
                    )}
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Detalhes das Visitas ao Site
                </DialogTitle>
                <DialogDescription>
                  Histórico completo de visitas com IP e localização de cada visitante
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingSiteVisits ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : siteVisits && siteVisits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Região</TableHead>
                      <TableHead>User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siteVisits.map((visit) => (
                      <TableRow key={visit.id} data-testid={`row-visit-${visit.id}`}>
                        <TableCell className="font-medium">
                          {format(new Date(visit.visitedAt), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell data-testid={`text-ip-${visit.id}`}>
                          {visit.ipAddress}
                        </TableCell>
                        <TableCell>
                          {visit.country ? (
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {visit.country}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.region || <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {visit.userAgent || <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma visita registrada ainda
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas Cadastradas
              </CardTitle>
              <CardDescription>
                Lista de todas as empresas registradas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : data?.companies && data.companies.length > 0 ? (
                <div className="space-y-3">
                  {data.companies.map((company) => (
                    <Card key={company.id} data-testid={`card-company-${company.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate" data-testid={`text-company-name-${company.id}`}>
                              {company.companyName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {company.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              CNPJ: {company.cnpj}
                            </p>
                          </div>
                          <Badge variant="secondary">Empresa</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma empresa cadastrada
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5" />
                Operadores Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de todos os operadores registrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : data?.operators && data.operators.length > 0 ? (
                <div className="space-y-3">
                  {data.operators.map((operator) => (
                    <Card key={operator.id} data-testid={`card-operator-${operator.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate" data-testid={`text-operator-name-${operator.id}`}>
                              {operator.fullName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {operator.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {operator.profession}
                            </p>
                          </div>
                          <Badge variant="secondary">Operador</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum operador cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
