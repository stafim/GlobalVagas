import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HardHat, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Settings,
  User,
  Bell,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo } from "react";
import type { Operator } from "@shared/schema";

export default function OperatorDashboard() {
  const [, setLocation] = useLocation();
  const { user, userType, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'operator')) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, userType, setLocation]);

  const profileCompletion = useMemo(() => {
    if (!user || userType !== 'operator') return { percentage: 0, missing: [], isComplete: false };
    
    const operatorUser = user as Operator;
    
    const fields = [
      { name: 'birthDate', label: 'Data de Nascimento', value: operatorUser.birthDate },
      { name: 'experienceYears', label: 'Anos de Experiência', value: operatorUser.experienceYears },
      { name: 'certifications', label: 'Certificações', value: operatorUser.certifications },
      { name: 'availability', label: 'Disponibilidade', value: operatorUser.availability },
      { name: 'preferredLocation', label: 'Localização Preferida', value: operatorUser.preferredLocation },
      { name: 'workType', label: 'Tipo de Trabalho', value: operatorUser.workType },
      { name: 'skills', label: 'Habilidades', value: operatorUser.skills },
      { name: 'bio', label: 'Sobre Você', value: operatorUser.bio },
      { name: 'profilePhotoUrl', label: 'Foto de Perfil', value: operatorUser.profilePhotoUrl },
    ];
    
    const totalFields = fields.length + 6; // 6 campos obrigatórios sempre preenchidos
    const filledOptionalFields = fields.filter(field => field.value && field.value.trim() !== '').length;
    const totalFilledFields = 6 + filledOptionalFields; // 6 obrigatórios + opcionais preenchidos
    
    const percentage = Math.round((totalFilledFields / totalFields) * 100);
    const missing = fields.filter(field => !field.value || field.value.trim() === '');
    const isComplete = percentage === 100;
    
    return { percentage, missing, isComplete };
  }, [user, userType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'operator') {
    return null;
  }
  
  const stats = [
    {
      title: "Candidaturas Enviadas",
      value: "0",
      icon: FileText,
      description: "Total de candidaturas",
      trend: null,
    },
    {
      title: "Vagas Salvas",
      value: "0",
      icon: Bookmark,
      description: "Vagas de interesse",
      trend: null,
    },
    {
      title: "Visualizações do Perfil",
      value: "0",
      icon: TrendingUp,
      description: "Empresas que viram seu perfil",
      trend: null,
    },
    {
      title: "Respostas Recebidas",
      value: "0",
      icon: CheckCircle2,
      description: "Retorno das empresas",
      trend: null,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">
                Meu Dashboard
              </h1>
              <p className="text-muted-foreground">
                Acompanhe suas candidaturas e oportunidades
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" data-testid="button-settings">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </Button>
              <Button onClick={() => setLocation("/perfil/operador")} data-testid="button-edit-profile">
                <User className="mr-2 h-5 w-5" />
                Editar Perfil
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Minhas Candidaturas</CardTitle>
                <CardDescription>
                  Acompanhe o status das suas candidaturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    Nenhuma candidatura ainda
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Comece a explorar as vagas disponíveis e candidate-se às oportunidades que combinam com você
                  </p>
                  <Button data-testid="button-browse-jobs">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Explorar Vagas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-search-jobs">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Buscar Vagas
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-saved-jobs">
                    <Bookmark className="mr-2 h-5 w-5" />
                    Vagas Salvas
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/perfil/operador")} data-testid="button-my-profile">
                    <User className="mr-2 h-5 w-5" />
                    Meu Perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-alerts">
                    <Bell className="mr-2 h-5 w-5" />
                    Alertas de Vagas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completude</span>
                    <Badge variant={profileCompletion.isComplete ? "default" : "secondary"}>
                      {profileCompletion.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Visibilidade</span>
                    <Badge variant={profileCompletion.isComplete ? "default" : "outline"}>
                      {profileCompletion.isComplete ? "Visível" : "Oculto"}
                    </Badge>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${profileCompletion.percentage}%` }}
                    />
                  </div>
                  
                  {profileCompletion.isComplete ? (
                    <div className="flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">
                        Seu perfil está completo e visível para recrutadores!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground mb-1">
                            Complete seu perfil para ser visível
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Seu perfil está oculto para recrutadores até que você complete todas as informações
                          </p>
                        </div>
                      </div>
                      
                      {profileCompletion.missing.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Campos faltantes ({profileCompletion.missing.length}):
                          </p>
                          <div className="space-y-1">
                            {profileCompletion.missing.slice(0, 5).map((field) => (
                              <div key={field.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                {field.label}
                              </div>
                            ))}
                            {profileCompletion.missing.length > 5 && (
                              <p className="text-xs text-muted-foreground ml-3.5">
                                +{profileCompletion.missing.length - 5} outros campos
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => setLocation("/perfil/operador")}
                        className="w-full"
                        size="sm"
                        data-testid="button-complete-profile"
                      >
                        Completar Perfil
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dicas para Você</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HardHat className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Mantenha seu perfil atualizado</p>
                        <p className="text-xs text-muted-foreground">
                          Adicione novas certificações e experiências
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Configure alertas</p>
                        <p className="text-xs text-muted-foreground">
                          Receba notificações de novas vagas
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
