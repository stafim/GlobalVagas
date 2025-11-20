import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Award,
  Clock,
  User,
  FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Job, Operator, Application } from "@shared/schema";

type ApplicationWithOperator = Application & { operator: Operator };

export default function JobApplications() {
  const [, setLocation] = useLocation();
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicationWithOperator | null>(null);
  
  // Get jobId from URL path
  const jobId = window.location.pathname.split('/').pop();

  const { data: job, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ['/api/jobs', jobId],
    enabled: !!jobId,
  });

  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithOperator[]>({
    queryKey: ['/api/jobs', jobId, 'applications'],
    enabled: !!jobId,
  });

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 hover:bg-green-600">Aceito</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoadingJob || isLoadingApplications) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Vaga não encontrada</CardTitle>
            <CardDescription>A vaga que você procura não existe ou foi removida.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/empresa/vagas')} data-testid="button-back-jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Minhas Vagas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/empresa/vagas')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2" data-testid="text-job-title">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.contractType}
                    </span>
                    {job.status === 'active' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary">Suspensa</Badge>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Users className="h-5 w-5" />
                  <span className="text-3xl font-bold" data-testid="text-total-applications">
                    {applications.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {applications.length === 1 ? 'Candidato' : 'Candidatos'}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum candidato ainda</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Esta vaga ainda não recebeu candidaturas. Quando operadores se candidatarem, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => {
              const { operator } = application;
              
              return (
                <Card 
                  key={application.id} 
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => setSelectedCandidate(application)}
                  data-testid={`card-candidate-${application.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={operator.profilePhotoUrl || undefined} />
                        <AvatarFallback className="text-lg">
                          {getInitials(operator.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate" data-testid={`text-candidate-name-${application.id}`}>
                          {operator.fullName}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {operator.profession}
                        </CardDescription>
                        {operator.experienceYears && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {operator.experienceYears} anos de experiência
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{operator.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{operator.phone}</span>
                      </div>

                      {operator.preferredLocation && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{operator.preferredLocation}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDateTime(application.appliedAt)}</span>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal com detalhes completos do candidato */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedCandidate.operator.profilePhotoUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(selectedCandidate.operator.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">
                      {selectedCandidate.operator.fullName}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedCandidate.operator.profession}
                    </DialogDescription>
                    <div className="mt-2">
                      {getStatusBadge(selectedCandidate.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações de Contato
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedCandidate.operator.email}`} className="text-primary hover:underline">
                        {selectedCandidate.operator.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedCandidate.operator.phone}`} className="text-primary hover:underline">
                        {selectedCandidate.operator.phone}
                      </a>
                    </div>
                    {selectedCandidate.operator.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(selectedCandidate.operator.birthDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experiência Profissional
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedCandidate.operator.experienceYears && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tempo de Experiência</p>
                          <p className="text-muted-foreground">{selectedCandidate.operator.experienceYears} anos</p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.operator.preferredLocation && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Localização Preferida</p>
                          <p className="text-muted-foreground">{selectedCandidate.operator.preferredLocation}</p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.operator.workType && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Tipo de Trabalho Preferido</p>
                          <p className="text-muted-foreground">{selectedCandidate.operator.workType}</p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.operator.availability && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Disponibilidade</p>
                          <p className="text-muted-foreground">{selectedCandidate.operator.availability}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCandidate.operator.certifications && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certificações
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedCandidate.operator.certifications}
                      </p>
                    </div>
                  </>
                )}

                {selectedCandidate.operator.skills && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Habilidades
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedCandidate.operator.skills}
                      </p>
                    </div>
                  </>
                )}

                {selectedCandidate.operator.bio && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Sobre
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedCandidate.operator.bio}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Candidatura enviada em {formatDateTime(selectedCandidate.appliedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => window.location.href = `mailto:${selectedCandidate.operator.email}`}
                    data-testid="button-email-candidate"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar E-mail
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${selectedCandidate.operator.phone}`}
                    data-testid="button-call-candidate"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
