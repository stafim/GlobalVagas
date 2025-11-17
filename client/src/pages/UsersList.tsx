import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Building2, HardHat, Mail, Phone, FileText } from "lucide-react";
import type { Company, Operator, Client } from "@shared/schema";

interface UsersListResponse {
  companies: Omit<Company, 'password'>[];
  operators: Omit<Operator, 'password'>[];
  clients: Client[];
  total: {
    companies: number;
    operators: number;
    clients: number;
  };
}

export default function UsersList() {
  const { data, isLoading } = useQuery<UsersListResponse>({
    queryKey: ['/api/users/list'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl mb-2">
              Usuários Cadastrados
            </h1>
            <p className="text-muted-foreground">
              Visualização de todos os usuários do sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Empresas Cadastradas
                </CardTitle>
                <CardDescription>Empresas que se registraram no site</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{data?.total.companies || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Clientes Admin
                </CardTitle>
                <CardDescription>Empresas gerenciadas pelo Admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{data?.total.clients || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5" />
                  Total de Operadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{data?.total.operators || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Empresas Cadastradas
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Empresas que se registraram através do formulário do site
              </p>
              
              {!data?.companies || data.companies.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma empresa cadastrada</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.companies.map((company) => (
                    <Card key={company.id} data-testid={`company-card-${company.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{company.companyName}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="text-xs">{company.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-xs">{company.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">CNPJ: {company.cnpj}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {company.industry && (
                          <Badge variant="secondary">{company.industry}</Badge>
                        )}
                        {company.size && (
                          <Badge variant="outline" className="ml-2">{company.size}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Clientes Admin
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Empresas gerenciadas através do painel administrativo
              </p>
              
              {!data?.clients || data.clients.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum cliente cadastrado</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.clients.map((client) => (
                    <Card key={client.id} data-testid={`client-card-${client.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{client.companyName}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="text-xs">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-xs">{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">CNPJ: {client.cnpj}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={client.isActive === 'true' ? "default" : "secondary"}>
                          {client.isActive === 'true' ? "Ativo" : "Inativo"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                <HardHat className="h-6 w-6 text-primary" />
                Operadores
              </h2>
              
              {!data?.operators || data.operators.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <HardHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum operador cadastrado</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.operators.map((operator) => (
                    <Card key={operator.id} data-testid={`operator-card-${operator.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{operator.fullName}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="text-xs">{operator.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-xs">{operator.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">CPF: {operator.cpf}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">{operator.profession}</Badge>
                        {operator.experienceYears && (
                          <Badge variant="outline" className="ml-2">
                            {operator.experienceYears} anos
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
