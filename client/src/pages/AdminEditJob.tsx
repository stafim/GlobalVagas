import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

const editJobSchema = insertJobSchema.pick({
  title: true,
  description: true,
  requirements: true,
  responsibilities: true,
  benefits: true,
  location: true,
  salary: true,
  status: true,
});

type EditJobFormData = z.infer<typeof editJobSchema>;

export default function AdminEditJob() {
  const { id } = useParams();
  const { userType } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ['/api/jobs', id],
    enabled: !!id && userType === 'admin',
  });

  const form = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    values: job ? {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      location: job.location,
      salary: job.salary || '',
      status: job.status,
    } : undefined,
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: EditJobFormData) => {
      return await apiRequest('PATCH', `/api/jobs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', id] });
      toast({
        title: "Vaga atualizada",
        description: "As alterações foram salvas com sucesso",
      });
      setLocation('/admin/vagas');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar vaga",
        description: "Tente novamente mais tarde",
      });
    },
  });

  const onSubmit = (data: EditJobFormData) => {
    updateJobMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Vaga não encontrada</p>
          <Button
            variant="outline"
            onClick={() => setLocation('/admin/vagas')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation('/admin/vagas')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Editar Vaga</h2>
          <p className="text-sm text-muted-foreground">
            Atualize as informações da vaga
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais da vaga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Vaga *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Ex: Operador de Empilhadeira"
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  {...form.register('location')}
                  placeholder="Ex: São Paulo, SP"
                  data-testid="input-location"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salário</Label>
                <Input
                  id="salary"
                  {...form.register('salary')}
                  placeholder="Ex: R$ 3.000,00"
                  data-testid="input-salary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as 'Active' | 'Suspended')}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Ativa</SelectItem>
                  <SelectItem value="Suspended">Suspensa</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição e Detalhes</CardTitle>
            <CardDescription>
              Informações detalhadas sobre a vaga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Descreva a vaga..."
                rows={4}
                data-testid="input-description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos *</Label>
              <Textarea
                id="requirements"
                {...form.register('requirements')}
                placeholder="Liste os requisitos..."
                rows={4}
                data-testid="input-requirements"
              />
              {form.formState.errors.requirements && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.requirements.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsabilidades *</Label>
              <Textarea
                id="responsibilities"
                {...form.register('responsibilities')}
                placeholder="Descreva as responsabilidades..."
                rows={4}
                data-testid="input-responsibilities"
              />
              {form.formState.errors.responsibilities && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.responsibilities.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefícios *</Label>
              <Textarea
                id="benefits"
                {...form.register('benefits')}
                placeholder="Liste os benefícios..."
                rows={4}
                data-testid="input-benefits"
              />
              {form.formState.errors.benefits && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.benefits.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/vagas')}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={updateJobMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateJobMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
