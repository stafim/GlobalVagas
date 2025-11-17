import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Search, MapPin, Clock, DollarSign, Users, ChevronRight, ChevronLeft, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertJobSchema, type Job } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

const jobFormSchema = insertJobSchema.extend({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  location: z.string().min(3, "Localização é obrigatória"),
  workType: z.string().min(1, "Tipo de trabalho é obrigatório"),
  contractType: z.string().min(1, "Tipo de contrato é obrigatório"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function CompanyJobs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setDialogOpen(false);
      setCurrentStep(1);
      form.reset();
      toast({
        title: "Vaga criada com sucesso!",
        description: "Sua vaga foi publicada e está visível para candidatos.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao criar vaga",
        description: "Tente novamente mais tarde.",
      });
    },
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      location: "",
      city: "",
      state: "",
      workType: "",
      contractType: "",
      salary: "",
      salaryPeriod: "mensal",
      experienceLevel: "",
      educationLevel: "",
      vacancies: "1",
      status: "active",
    },
  });

  const onSubmit = (data: JobFormValues) => {
    createJobMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof JobFormValues)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'location', 'workType', 'contractType'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['description'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeJobs = jobs.filter((job) => job.status === 'active').length;
  const closedJobs = jobs.filter((job) => job.status === 'closed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vagas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentStep(1)} data-testid="button-new-job">
              <Plus className="h-4 w-4 mr-2" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Vaga</DialogTitle>
              <DialogDescription>
                Preencha as informações da vaga em {currentStep} de 3 etapas
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informações Básicas</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Vaga *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Operador de Guindaste" {...field} data-testid="input-job-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo, SP" {...field} data-testid="input-job-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vacancies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Vagas</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} data-testid="input-job-vacancies" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="workType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Trabalho *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-work-type">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="presencial">Presencial</SelectItem>
                                <SelectItem value="remoto">Remoto</SelectItem>
                                <SelectItem value="hibrido">Híbrido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contractType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Contrato *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-contract-type">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="clt">CLT</SelectItem>
                                <SelectItem value="pj">PJ</SelectItem>
                                <SelectItem value="temporario">Temporário</SelectItem>
                                <SelectItem value="estagio">Estágio</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Descrição e Requisitos</h3>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Vaga *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva as principais atividades e responsabilidades..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-job-description"
                            />
                          </FormControl>
                          <FormDescription>
                            Mínimo de 20 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste os requisitos necessários (um por linha)"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ''}
                              data-testid="textarea-job-requirements"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsabilidades</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste as principais responsabilidades (uma por linha)"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ''}
                              data-testid="textarea-job-responsibilities"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Detalhes Complementares</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salário</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: R$ 5.000,00" {...field} value={field.value || ''} data-testid="input-job-salary" />
                            </FormControl>
                            <FormDescription>Deixe em branco para "A combinar"</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Experiência</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                              <FormControl>
                                <SelectTrigger data-testid="select-experience-level">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="junior">Júnior</SelectItem>
                                <SelectItem value="pleno">Pleno</SelectItem>
                                <SelectItem value="senior">Sênior</SelectItem>
                                <SelectItem value="especialista">Especialista</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benefícios</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste os benefícios oferecidos (um por linha)"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ''}
                              data-testid="textarea-job-benefits"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolaridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                            <FormControl>
                              <SelectTrigger data-testid="select-education-level">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                              <SelectItem value="medio">Ensino Médio</SelectItem>
                              <SelectItem value="tecnico">Técnico</SelectItem>
                              <SelectItem value="superior">Superior</SelectItem>
                              <SelectItem value="pos">Pós-graduação</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} data-testid="button-prev-step">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto" data-testid="button-next-step">
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createJobMutation.isPending}
                      className="ml-auto"
                      data-testid="button-submit-job"
                    >
                      {createJobMutation.isPending ? "Criando..." : "Publicar Vaga"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vagas Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-jobs">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vagas publicadas atualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Vagas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-jobs">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as vagas criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vagas Fechadas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-closed-jobs">{closedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vagas finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Carregando vagas...</div>
          </CardContent>
        </Card>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover-elevate" data-testid={`card-job-${job.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </Badge>
                      <Badge variant="outline">{job.workType}</Badge>
                      <Badge variant="outline">{job.contractType}</Badge>
                      {job.salary && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.salary}
                        </Badge>
                      )}
                      <Badge
                        className={
                          job.status === 'active'
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                        }
                      >
                        {job.status === 'active' ? 'Ativa' : 'Fechada'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {job.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <Clock className="h-3 w-3 inline mr-1" />
                    Publicado em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  {job.vacancies && (
                    <span>
                      <Users className="h-3 w-3 inline mr-1" />
                      {job.vacancies} {job.vacancies === '1' ? 'vaga' : 'vagas'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suas Vagas</CardTitle>
            <CardDescription>
              Gerencie e acompanhe suas vagas publicadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Nenhuma vaga publicada
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Comece publicando sua primeira vaga para atrair os melhores profissionais do setor
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-job">
                <Plus className="mr-2 h-5 w-5" />
                Publicar Primeira Vaga
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
