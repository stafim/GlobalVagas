import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, Company } from "@shared/schema";
import { useState, useEffect } from "react";

export default function JobView() {
  const [, params] = useRoute("/vaga/:id");
  const { toast } = useToast();
  const [hasApplied, setHasApplied] = useState(false);

  const jobQuery = useQuery<{ job: Job; company: Company }>({
    queryKey: ['/api/jobs', params?.id],
    enabled: !!params?.id,
  });

  const checkApplicationQuery = useQuery<{ hasApplied: boolean }>({
    queryKey: ['/api/applications/check', params?.id],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (checkApplicationQuery.data) {
      setHasApplied(checkApplicationQuery.data.hasApplied);
    }
  }, [checkApplicationQuery.data]);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/applications", {
        jobId: params?.id,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao aplicar a vaga");
      }
      return response.json();
    },
    onSuccess: () => {
      setHasApplied(true);
      queryClient.invalidateQueries({ queryKey: ['/api/applications/check', params?.id] });
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao aplicar",
        description: error.message,
      });
    },
  });

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
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botão de Aplicar */}
          {hasApplied ? (
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
              onClick={() => applyMutation.mutate()}
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
  );
}
