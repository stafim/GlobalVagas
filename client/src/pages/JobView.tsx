import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Award,
  Globe,
  Phone,
  Mail,
  Sparkles,
  Target,
  Heart,
  CheckCircle2,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, Company, QuestionWithRequired } from "@shared/schema";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";

export default function JobView() {
  const [, params] = useRoute("/vaga/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const jobQuery = useQuery<{ job: Job; company: Company }>({
    queryKey: ['/api/jobs', params?.id],
    enabled: !!params?.id,
  });

  const checkApplicationQuery = useQuery<{ hasApplied: boolean }>({
    queryKey: ['/api/applications/check', params?.id],
    enabled: !!params?.id,
  });

  const questionsQuery = useQuery<QuestionWithRequired[]>({
    queryKey: ['/api/jobs', params?.id, 'questions'],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (checkApplicationQuery.data) {
      setHasApplied(checkApplicationQuery.data.hasApplied);
    }
  }, [checkApplicationQuery.data]);

  // Increment view count when page loads
  useEffect(() => {
    const incrementView = async () => {
      if (params?.id) {
        try {
          await apiRequest("POST", `/api/jobs/${params.id}/increment-view`);
        } catch (error) {
          // Silently fail - view count is not critical
        }
      }
    };

    incrementView();
  }, [params?.id]);

  const applyMutation = useMutation({
    mutationFn: async (answers?: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/applications", {
        jobId: params?.id,
        answers: answers || {},
      });
      if (!response.ok) {
        const error = await response.json();
        const errorObj = { 
          profileIncomplete: error.profileIncomplete || false,
          message: error.message || "Erro ao aplicar a vaga",
          missingFields: error.missingFields || []
        };
        throw errorObj;
      }
      return response.json();
    },
    onSuccess: () => {
      setHasApplied(true);
      setDialogOpen(false);
      setAnswers({});
      queryClient.invalidateQueries({ queryKey: ['/api/applications/check', params?.id] });
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
      });
    },
    onError: (error: any) => {
      if (error?.profileIncomplete === true) {
        setDialogOpen(false);
        toast({
          title: "Complete seu perfil",
          description: "Para se candidatar a esta vaga, precisamos que você complete seu perfil com todas as informações obrigatórias. É rápido e simples!",
          action: (
            <Button
              size="sm"
              onClick={() => setLocation('/perfil/operador')}
              data-testid="button-complete-profile-toast"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Completar Agora
            </Button>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao aplicar",
          description: error?.message || "Erro ao aplicar a vaga",
        });
      }
    },
  });

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se candidatar a uma vaga.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    const questions = questionsQuery.data || [];
    if (questions.length > 0) {
      setDialogOpen(true);
    } else {
      applyMutation.mutate({});
    }
  };

  const handleSubmitApplication = () => {
    const questions = questionsQuery.data || [];
    
    // Validate only required questions
    const requiredQuestions = questions.filter(q => q.isRequired === 'true');
    const allRequiredAnswered = requiredQuestions.every(q => answers[q.id] && answers[q.id].trim() !== '');
    
    if (!allRequiredAnswered) {
      toast({
        variant: "destructive",
        title: "Respostas incompletas",
        description: "Por favor, responda todas as perguntas obrigatórias antes de enviar.",
      });
      return;
    }
    
    applyMutation.mutate(answers);
  };

  if (jobQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (jobQuery.error || !jobQuery.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Vaga não encontrada</CardTitle>
            <CardDescription>
              A vaga que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { job, company } = jobQuery.data;

  return (
    <>
      <Header />
      <div className="w-full">
        {/* Banner da empresa */}
        {company?.bannerUrl && (
          <div className="relative w-full overflow-hidden">
            <img 
              src={`${company.bannerUrl}?t=${Date.now()}`}
              alt={company.companyName}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Perfil da Empresa */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={company?.logoUrl || undefined} 
                alt={company?.companyName}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-primary/10">
                <Building2 className="h-12 w-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {company?.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {company.industry}
                  </div>
                )}
                {company?.size && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {company.size}
                  </div>
                )}
                {company?.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {company?.about && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Sobre a Empresa
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{company.about}</p>
            </div>
          )}

          {company?.mission && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Nossa Missão
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{company.mission}</p>
              </div>
            </>
          )}

          {company?.culture && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Cultura e Valores
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{company.culture}</p>
              </div>
            </>
          )}

          {(company?.email || company?.phone) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-4 text-sm">
                {company?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detalhes da Vaga */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.workType}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {job.contractType}
                </Badge>
                {job.salary && (
                  <Badge variant="secondary" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    {job.salary}
                  </Badge>
                )}
                {job.tags && job.tags.length > 0 && job.tags.map((tag, index) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {job.status === 'suspended' && (
                  <Badge 
                    variant="outline" 
                    className="bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400"
                  >
                    ⏸ Vaga Suspensa
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botão de Aplicar */}
          {job.status === 'suspended' ? (
            <div className="space-y-2">
              <Button 
                size="default" 
                disabled
                variant="secondary"
                data-testid="button-job-suspended"
              >
                ⏸ Vaga Suspensa - Não aceita candidaturas
              </Button>
              <p className="text-xs text-muted-foreground">
                Esta vaga foi temporariamente pausada pela empresa e não está aceitando novas candidaturas no momento.
              </p>
            </div>
          ) : hasApplied ? (
            <Button 
              size="default" 
              disabled
              data-testid="button-already-applied"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Você já se candidatou a esta vaga
            </Button>
          ) : (
            <Button 
              size="default" 
              onClick={handleApplyClick}
              disabled={applyMutation.isPending}
              data-testid="button-apply"
            >
              {applyMutation.isPending ? "Aplicando..." : "Aplicar a esta vaga"}
            </Button>
          )}

          <Separator />

          {/* Descrição */}
          {job.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Descrição da Vaga</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Requisitos */}
          {job.requirements && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Requisitos</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Responsabilidades */}
          {job.responsibilities && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Responsabilidades</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}

          {/* Benefícios */}
          {job.benefits && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Benefícios</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
            </div>
          )}

          <Separator />

          {/* Informações Adicionais */}
          <div className="grid gap-4 md:grid-cols-2">
            {job.experienceLevel && (
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nível de Experiência</p>
                  <p className="font-medium">{job.experienceLevel}</p>
                </div>
              </div>
            )}
            {job.educationLevel && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Escolaridade</p>
                  <p className="font-medium">{job.educationLevel}</p>
                </div>
              </div>
            )}
            {job.vacancies && (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Vagas Disponíveis</p>
                  <p className="font-medium">{job.vacancies}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>

    {/* Diálogo de Questionário */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Questionário da Vaga</DialogTitle>
          <DialogDescription>
            Por favor, responda as seguintes perguntas para completar sua candidatura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {questionsQuery.data?.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {index + 1}. {question.questionText}
                  {question.isRequired === 'true' && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {question.isRequired === 'true' && (
                  <Badge variant="destructive" className="text-xs">
                    Obrigatória
                  </Badge>
                )}
              </div>
              
              {question.questionType === 'text' && (
                <Input
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Sua resposta..."
                  data-testid={`input-answer-${question.id}`}
                />
              )}
              
              {question.questionType === 'textarea' && (
                <div className="space-y-1">
                  <Textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    placeholder="Sua resposta..."
                    className="min-h-[200px]"
                    maxLength={1000}
                    data-testid={`textarea-answer-${question.id}`}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(answers[question.id] || '').length}/1000 caracteres
                  </p>
                </div>
              )}
              
              {question.questionType === 'multiple_choice' && question.options && (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                >
                  {question.options.split(',').map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.trim()} 
                        id={`${question.id}-${optionIndex}`}
                        data-testid={`radio-answer-${question.id}-${optionIndex}`}
                      />
                      <Label htmlFor={`${question.id}-${optionIndex}`} className="font-normal cursor-pointer">
                        {option.trim()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            data-testid="button-cancel-application"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitApplication}
            disabled={applyMutation.isPending}
            data-testid="button-submit-application"
          >
            {applyMutation.isPending ? "Enviando..." : "Enviar Candidatura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
