import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, HardHat, Users } from "lucide-react";
import type { Company, Operator } from "@shared/schema";

export default function AdminDashboard() {
  const { userType } = useAuth();

  const { data, isLoading } = useQuery<{
    companies: Company[];
    operators: Operator[];
    total: { companies: number; operators: number };
  }>({
    queryKey: ['/api/users/list'],
    enabled: userType === 'admin',
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3 mb-8">
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
