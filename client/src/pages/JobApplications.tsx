import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Users, 
  Mail,
  MapPin, 
  Calendar, 
  Briefcase, 
  Award,
  Clock,
  User,
  FileText,
  FileDown,
  Search,
  Filter,
  Bot,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Job, Operator, Application, Question, ApplicationAnswer } from "@shared/schema";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

type ApplicationWithOperator = Application & { operator: Operator };
type AnswerWithQuestion = ApplicationAnswer & { question: Question };

type AIAnalysis = {
  jobSummary: string;
  candidateSummary: string;
  strengths: string[];
  weaknesses: string[];
  matchPercentage: number;
  recommendation: string;
};

export default function JobApplications() {
  const [, setLocation] = useLocation();
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicationWithOperator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();
  
  // Get jobId from URL params
  const [, params] = useRoute("/empresa/vaga/:id/candidatos");
  const jobId = params?.id;

  const { data: job, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ['/api/jobs', jobId],
    enabled: !!jobId,
  });

  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithOperator[]>({
    queryKey: ['/api/jobs', jobId, 'applications'],
    enabled: !!jobId,
  });

  const { data: answers = [] } = useQuery<AnswerWithQuestion[]>({
    queryKey: ['/api/applications', selectedCandidate?.id, 'answers'],
    enabled: !!selectedCandidate?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId, 'applications'] });
      toast({
        title: "Status atualizado",
        description: "O status da candidatura foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status da candidatura.",
      });
    }
  });

  const analyzeWithAIMutation = useMutation({
    mutationFn: async ({ jobId, applicationId }: { jobId: string; applicationId: string }) => {
      const response = await apiRequest('POST', '/api/company/analyze-candidate', { 
        jobId, 
        applicationId 
      });
      return response as unknown as AIAnalysis;
    },
    onSuccess: (data: AIAnalysis) => {
      setCurrentAnalysis(data);
      setAiAnalysisOpen(true);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao analisar candidato",
        description: error.message || "Não foi possível analisar o candidato com IA.",
      });
    }
  });

  // Filtros
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    applications.forEach(app => {
      if (app.operator.preferredLocation) {
        locations.add(app.operator.preferredLocation);
      }
    });
    return Array.from(locations).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Filtro de busca
      const matchesSearch = searchTerm === "" || 
        app.operator.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.operator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.operator.profession.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      // Filtro de localização
      const matchesLocation = locationFilter === "all" || app.operator.preferredLocation === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [applications, searchTerm, statusFilter, locationFilter]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId, status: newStatus });
  };

  const downloadCV = (operator: Operator, jobTitle: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Logo da Operlist
    const logoWidth = 40;
    const logoHeight = 15;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(operlistLogo, 'PNG', logoX, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 10;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CURRÍCULO", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Nome
    doc.setFontSize(16);
    doc.text(operator.fullName, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Profissão
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (operator.profession) {
      doc.text(operator.profession, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;
    }

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // Informações de Contato
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMAÇÕES DE CONTATO", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${operator.email}`, 20, yPos);
    yPos += 6;
    doc.text(`Telefone: ${operator.phone}`, 20, yPos);
    yPos += 6;
    
    if (operator.birthDate) {
      doc.text(`Data de Nascimento: ${formatDate(operator.birthDate)}`, 20, yPos);
      yPos += 6;
    }

    if (operator.preferredLocation) {
      doc.text(`Localização Preferida: ${operator.preferredLocation}`, 20, yPos);
      yPos += 10;
    } else {
      yPos += 4;
    }

    // Experiência Profissional
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EXPERIÊNCIA PROFISSIONAL", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (operator.experienceYears) {
      doc.text(`Tempo de Experiência: ${operator.experienceYears} anos`, 20, yPos);
      yPos += 6;
    }

    if (operator.workType) {
      doc.text(`Tipo de Trabalho Preferido: ${operator.workType}`, 20, yPos);
      yPos += 6;
    }

    if (operator.availability) {
      doc.text(`Disponibilidade: ${operator.availability}`, 20, yPos);
      yPos += 10;
    } else {
      yPos += 4;
    }

    // Habilidades
    if (operator.skills) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("HABILIDADES", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const skillsLines = doc.splitTextToSize(operator.skills, pageWidth - 40);
      doc.text(skillsLines, 20, yPos);
      yPos += (skillsLines.length * 6) + 4;
    }

    // Certificações
    if (operator.certifications) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICAÇÕES", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const certLines = doc.splitTextToSize(operator.certifications, pageWidth - 40);
      doc.text(certLines, 20, yPos);
      yPos += (certLines.length * 6) + 4;
    }

    // Sobre
    if (operator.bio) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SOBRE", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const bioLines = doc.splitTextToSize(operator.bio, pageWidth - 40);
      doc.text(bioLines, 20, yPos);
    }

    // Footer
    const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Currículo gerado para a vaga: ${jobTitle}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text(`Data de geração: ${timestamp}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });

    // Download
    const fileName = `CV_${operator.fullName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
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

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl" data-testid="text-job-title">
                  {job.title}
                </CardTitle>
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

        {applications.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Filtros</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-candidates"
                  />
                </div>

                {/* Filtro de Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="accepted">Aceito</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Localização */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger data-testid="select-location-filter">
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Localizações</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredApplications.length !== applications.length && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Mostrando {filteredApplications.length} de {applications.length} candidatos
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Não há candidatos que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredApplications.map((application, index) => {
              const { operator } = application;
              const isLocked = index > 0; // Apenas o primeiro candidato está desbloqueado
              
              return (
                <div key={application.id} className="relative">
                  <Card 
                    className={`transition-all ${isLocked ? 'cursor-not-allowed' : 'hover-elevate cursor-pointer'}`}
                    onClick={() => !isLocked && setSelectedCandidate(application)}
                    data-testid={`card-candidate-${application.id}`}
                  >
                    <CardContent className={`p-3 ${isLocked ? 'blur-sm select-none' : ''}`}>
                      <div className="flex items-center gap-3">
                        {/* Avatar e Nome */}
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={operator.profilePhotoUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(operator.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      
                      {/* Informações principais */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate" data-testid={`text-candidate-name-${application.id}`}>
                            {operator.fullName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {operator.profession}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          {operator.experienceYears && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span>{operator.experienceYears}</span>
                            </div>
                          )}
                          {operator.preferredLocation && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{operator.preferredLocation}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{operator.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (jobId) {
                                analyzeWithAIMutation.mutate({ jobId, applicationId: application.id });
                              }
                            }}
                            title="Analisar com IA"
                            data-testid={`button-analyze-ai-${application.id}`}
                            className="h-7 px-2"
                            disabled={analyzeWithAIMutation.isPending}
                          >
                            {analyzeWithAIMutation.isPending ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadCV(operator, job.title);
                            }}
                            title="Baixar CV"
                            data-testid={`button-download-cv-${application.id}`}
                            className="h-7 px-2"
                          >
                            <FileDown className="h-3 w-3" />
                          </Button>
                          
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(application.appliedAt)}
                          </div>
                          
                          <Select 
                            value={application.status} 
                            onValueChange={(value) => {
                              handleStatusChange(application.id, value);
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger 
                              className="w-[140px] h-8"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`select-status-${application.id}`}
                            >
                              <SelectValue>
                                {getStatusLabel(application.status)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="accepted">Aceito</SelectItem>
                              <SelectItem value="rejected">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Overlay de bloqueio para candidatos além do primeiro */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                    <div className="text-center p-4 max-w-xs">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Candidato Bloqueado</h3>
                      <p className="text-xs text-muted-foreground">
                        Você pode visualizar apenas 1 candidato por vaga. Entre em contato para desbloquear mais candidatos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Select 
                          value={selectedCandidate.status} 
                          onValueChange={(value) => {
                            handleStatusChange(selectedCandidate.id, value);
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger 
                            className="w-[160px]"
                            data-testid="select-modal-status"
                          >
                            <SelectValue>
                              {getStatusLabel(selectedCandidate.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="accepted">Aceito</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                      <SiWhatsapp className="h-4 w-4 text-muted-foreground" />
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

                {answers.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Respostas do Questionário
                      </h3>
                      <div className="space-y-4">
                        {answers.map((answer, index) => (
                          <div key={answer.id} className="bg-muted/30 p-4 rounded-md space-y-2">
                            <p className="font-medium text-sm">
                              {index + 1}. {answer.question.questionText}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-4">
                              {answer.answerText}
                            </p>
                          </div>
                        ))}
                      </div>
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

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => downloadCV(selectedCandidate.operator, job?.title || 'Vaga')}
                    data-testid="button-download-cv-modal"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Baixar CV
                  </Button>

                  <Button 
                    variant="outline" 
                    className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400"
                    onClick={() => {
                      const phoneNumber = selectedCandidate.operator.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/55${phoneNumber}`, '_blank');
                    }}
                    data-testid="button-whatsapp-candidate"
                  >
                    <SiWhatsapp className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Análise com IA */}
      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {currentAnalysis && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Análise com IA</DialogTitle>
                    <DialogDescription>
                      Análise de compatibilidade entre candidato e vaga
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              {/* Porcentagem de Aderência */}
              <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-6xl font-bold text-primary mb-2">
                  {currentAnalysis.matchPercentage}%
                </div>
                <p className="text-sm text-muted-foreground">Compatibilidade</p>
                <Badge 
                  className="mt-3"
                  variant={
                    currentAnalysis.matchPercentage >= 75 ? "default" : 
                    currentAnalysis.matchPercentage >= 50 ? "secondary" : 
                    "outline"
                  }
                >
                  {currentAnalysis.recommendation}
                </Badge>
              </div>

              <Separator />

              {/* Resumo da Vaga */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Resumo da Vaga
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentAnalysis.jobSummary}
                </p>
              </div>

              <Separator />

              {/* Resumo do Candidato */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Resumo do Candidato
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentAnalysis.candidateSummary}
                </p>
              </div>

              <Separator />

              {/* Pontos Fortes */}
              {currentAnalysis.strengths && currentAnalysis.strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Pontos Fortes
                  </h3>
                  <div className="space-y-2">
                    {currentAnalysis.strengths.map((strength, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900/30"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-900 dark:text-green-100">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Pontos Fracos */}
              {currentAnalysis.weaknesses && currentAnalysis.weaknesses.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Pontos de Atenção
                    </h3>
                    <div className="space-y-2">
                      {currentAnalysis.weaknesses.map((weakness, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-900/30"
                        >
                          <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-orange-900 dark:text-orange-100">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Botão para fechar */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => setAiAnalysisOpen(false)}
                  data-testid="button-close-ai-analysis"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
