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
import { Plus, Trash2, Edit, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractTypeSchema, type ContractType } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const contractTypeFormSchema = insertContractTypeSchema.extend({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
}).omit({ companyId: true });

type ContractTypeFormData = z.infer<typeof contractTypeFormSchema>;

export default function CompanyContractTypes() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContractType, setEditingContractType] = useState<ContractType | null>(null);

  const { data: contractTypes, isLoading } = useQuery<ContractType[]>({
    queryKey: ["/api/company/contract-types"],
  });

  const form = useForm<ContractTypeFormData>({
    resolver: zodResolver(contractTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: "true",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContractTypeFormData) => {
      return await apiRequest("POST", "/api/company/contract-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/contract-types"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Tipo de contrato criado",
        description: "O tipo de contrato foi criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar tipo de contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContractTypeFormData> }) => {
      return await apiRequest("PATCH", `/api/company/contract-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/contract-types"] });
      setEditingContractType(null);
      form.reset();
      toast({
        title: "Tipo de contrato atualizado",
        description: "O tipo de contrato foi atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar tipo de contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/company/contract-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/contract-types"] });
      toast({
        title: "Tipo de contrato deletado",
        description: "O tipo de contrato foi removido com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar tipo de contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContractTypeFormData) => {
    if (editingContractType) {
      updateMutation.mutate({ id: editingContractType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (contractType: ContractType) => {
    setEditingContractType(contractType);
    form.reset({
      name: contractType.name,
      description: contractType.description || "",
      isActive: contractType.isActive,
    });
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingContractType(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando tipos de contrato...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Contrato</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os tipos de contrato que você oferece
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-contract-type"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo de Contrato
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contractTypes?.map((contractType) => (
          <Card key={contractType.id} data-testid={`card-contract-type-${contractType.id}`}>
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{contractType.name}</CardTitle>
                </div>
                <Badge variant={contractType.isActive === "true" ? "default" : "secondary"}>
                  {contractType.isActive === "true" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              {contractType.description && (
                <CardDescription className="line-clamp-2">
                  {contractType.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(contractType)}
                  data-testid={`button-edit-contract-type-${contractType.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-delete-contract-type-${contractType.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o tipo de contrato "{contractType.name}"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(contractType.id)}
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

      {contractTypes?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tipo de contrato cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro tipo de contrato para categorizar suas vagas.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Tipo de Contrato
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen || editingContractType !== null} onOpenChange={handleCloseDialog}>
        <DialogContent data-testid="dialog-contract-type-form">
          <DialogHeader>
            <DialogTitle>
              {editingContractType ? "Editar Tipo de Contrato" : "Novo Tipo de Contrato"}
            </DialogTitle>
            <DialogDescription>
              {editingContractType
                ? "Atualize as informações do tipo de contrato"
                : "Preencha os dados para criar um novo tipo de contrato"}
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
                        placeholder="Ex: CLT, PJ, Temporário"
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
                        placeholder="Descreva o tipo de contrato (opcional)"
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
                    : editingContractType
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
