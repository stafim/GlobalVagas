import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Briefcase, Plus, Search, MapPin, Clock, DollarSign, Users, ChevronRight, ChevronLeft, Building2, Check, ChevronsUpDown, Eye, Trash2, UserCheck, ExternalLink, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertJobSchema, type Job } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { brazilianCities } from "@/lib/brazilian-cities";
import { cn } from "@/lib/utils";

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
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

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

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await apiRequest('DELETE', `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      toast({
        title: "Vaga excluída com sucesso!",
        description: "A vaga foi removida do sistema.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir vaga",
        description: "Tente novamente mais tarde.",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ jobId, newStatus }: { jobId: string; newStatus: string }) => {
      const response = await apiRequest('PATCH', `/api/jobs/${jobId}/status`, { status: newStatus });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: variables.newStatus === 'active' ? "Vaga ativada!" : "Vaga suspensa!",
        description: variables.newStatus === 'active' 
          ? "A vaga agora está visível para candidatos." 
          : "A vaga foi pausada temporariamente.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
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

  const handlePublishJob = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      createJobMutation.mutate(data);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  const suspendedJobs = jobs.filter((job) => job.status === 'suspended').length;

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
            <Button size="lg" onClick={() => setCurrentStep(1)} className="shadow-lg" data-testid="button-new-job">
              <Plus className="h-5 w-5 mr-2" />
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
              <form onSubmit={handleFormSubmit} className="space-y-4">
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
                          <FormItem className="flex flex-col">
                            <FormLabel>Localização *</FormLabel>
                            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={locationOpen}
                                    className={cn(
                                      "justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="select-job-location"
                                  >
                                    {field.value
                                      ? brazilianCities.find(
                                          (city) => city.value === field.value
                                        )?.label
                                      : "Selecione uma cidade"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar cidade..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                                    <CommandGroup>
                                      {brazilianCities.map((city) => (
                                        <CommandItem
                                          key={city.value}
                                          value={city.label}
                                          onSelect={() => {
                                            form.setValue("location", city.value);
                                            form.setValue("city", city.label.split(",")[0].trim());
                                            form.setValue("state", city.state);
                                            setLocationOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === city.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {city.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
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
                      type="button"
                      onClick={handlePublishJob}
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
              Vagas Suspensas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-suspended-jobs">{suspendedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Temporariamente pausadas
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
            <Card key={job.id} className="hover-elevate transition-all" data-testid={`card-job-${job.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1.5 text-foreground">{job.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {job.workType}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {job.contractType}
                      </Badge>
                      {job.salary && (
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.salary}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 text-xs",
                      job.status === 'active'
                        ? 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400'
                        : 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400'
                    )}
                    variant="outline"
                  >
                    {job.status === 'active' ? '● Ativa' : '⏸ Suspensa'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    {job.vacancies && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.vacancies} {job.vacancies === '1' ? 'vaga' : 'vagas'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/vaga/${job.id}`}>
                      <Button
                        size="sm"
                        variant="default"
                        data-testid={`button-view-job-page-${job.id}`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Visualizar Vaga
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedJob(job);
                        setDetailsOpen(true);
                      }}
                      data-testid={`button-view-details-${job.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        toast({
                          title: "Em desenvolvimento",
                          description: "Sistema de candidaturas em breve!",
                        });
                      }}
                      data-testid={`button-candidates-${job.id}`}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newStatus = job.status === 'active' ? 'suspended' : 'active';
                        toggleStatusMutation.mutate({ jobId: job.id, newStatus });
                      }}
                      disabled={toggleStatusMutation.isPending}
                      data-testid={`button-toggle-status-${job.id}`}
                      title={job.status === 'active' ? 'Suspender vaga' : 'Ativar vaga'}
                    >
                      {job.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setJobToDelete(job.id);
                        setDeleteDialogOpen(true);
                      }}
                      data-testid={`button-delete-job-${job.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

      {/* Modal de Detalhes da Vaga */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Detalhes completos da vaga
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedJob.location}
                </Badge>
                <Badge variant="outline">{selectedJob.workType}</Badge>
                <Badge variant="outline">{selectedJob.contractType}</Badge>
                {selectedJob.salary && (
                  <Badge variant="outline">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {selectedJob.salary}
                  </Badge>
                )}
                <Badge
                  className={
                    selectedJob.status === 'active'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                  }
                >
                  {selectedJob.status === 'active' ? 'Ativa' : 'Suspensa'}
                </Badge>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">Requisitos</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              {selectedJob.responsibilities && (
                <div>
                  <h3 className="font-semibold mb-2">Responsabilidades</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.responsibilities}
                  </p>
                </div>
              )}

              {selectedJob.benefits && (
                <div>
                  <h3 className="font-semibold mb-2">Benefícios</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.benefits}
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedJob.experienceLevel && (
                  <div>
                    <span className="font-semibold">Nível de Experiência:</span>
                    <p className="text-muted-foreground capitalize">{selectedJob.experienceLevel}</p>
                  </div>
                )}
                {selectedJob.educationLevel && (
                  <div>
                    <span className="font-semibold">Escolaridade:</span>
                    <p className="text-muted-foreground capitalize">{selectedJob.educationLevel}</p>
                  </div>
                )}
                {selectedJob.vacancies && (
                  <div>
                    <span className="font-semibold">Vagas:</span>
                    <p className="text-muted-foreground">{selectedJob.vacancies}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Publicado em:</span>
                  <p className="text-muted-foreground">
                    {new Date(selectedJob.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A vaga será permanentemente excluída do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (jobToDelete) {
                  deleteJobMutation.mutate(jobToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteJobMutation.isPending ? "Excluindo..." : "Excluir Vaga"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
