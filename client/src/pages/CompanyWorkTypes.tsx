import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkTypeSchema, type WorkType } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const workTypeFormSchema = insertWorkTypeSchema.extend({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
}).omit({ companyId: true });

type WorkTypeFormData = z.infer<typeof workTypeFormSchema>;

export default function CompanyWorkTypes() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);

  const { data: workTypes, isLoading } = useQuery<WorkType[]>({
    queryKey: ["/api/company/work-types"],
  });

  const form = useForm<WorkTypeFormData>({
    resolver: zodResolver(workTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: "true",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WorkTypeFormData) => {
      return await apiRequest("POST", "/api/company/work-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/work-types"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Tipo de trabalho criado",
        description: "O tipo de trabalho foi criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar tipo de trabalho",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkTypeFormData> }) => {
      return await apiRequest("PATCH", `/api/company/work-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/work-types"] });
      setEditingWorkType(null);
      form.reset();
      toast({
        title: "Tipo de trabalho atualizado",
        description: "O tipo de trabalho foi atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar tipo de trabalho",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/company/work-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/work-types"] });
      toast({
        title: "Tipo de trabalho deletado",
        description: "O tipo de trabalho foi removido com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar tipo de trabalho",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkTypeFormData) => {
    if (editingWorkType) {
      updateMutation.mutate({ id: editingWorkType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (workType: WorkType) => {
    setEditingWorkType(workType);
    form.reset({
      name: workType.name,
      description: workType.description || "",
      isActive: workType.isActive,
    });
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingWorkType(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando tipos de trabalho...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Trabalho</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os tipos de trabalho que você oferece
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-work-type"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo de Trabalho
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workTypes?.map((workType) => (
          <Card key={workType.id} data-testid={`card-work-type-${workType.id}`}>
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{workType.name}</CardTitle>
                </div>
                <Badge variant={workType.isActive === "true" ? "default" : "secondary"}>
                  {workType.isActive === "true" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              {workType.description && (
                <CardDescription className="line-clamp-2">
                  {workType.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(workType)}
                  data-testid={`button-edit-work-type-${workType.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-delete-work-type-${workType.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o tipo de trabalho "{workType.name}"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(workType.id)}
                        data-testid="button-confirm-delete"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workTypes?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tipo de trabalho cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro tipo de trabalho para categorizar suas vagas.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Tipo de Trabalho
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen || editingWorkType !== null} onOpenChange={handleCloseDialog}>
        <DialogContent data-testid="dialog-work-type-form">
          <DialogHeader>
            <DialogTitle>
              {editingWorkType ? "Editar Tipo de Trabalho" : "Novo Tipo de Trabalho"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkType
                ? "Atualize as informações do tipo de trabalho"
                : "Preencha os dados para criar um novo tipo de trabalho"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Tempo Integral, Meio Período"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o tipo de trabalho (opcional)"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvando..."
                    : editingWorkType
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
