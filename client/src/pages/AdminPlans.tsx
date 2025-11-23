import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Plan } from "@shared/schema";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPlans() {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    vacancyQuantity: "",
    features: "",
    isActive: "true",
  });

  // Função para formatar valor em moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para obter centavos
    const amount = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  // Função para remover formatação e obter apenas números
  const unformatCurrency = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Handler para mudança de preço
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    retry: false,
    enabled: userType === 'admin',
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: typeof formData) => {
      return await apiRequest('POST', '/api/plans', planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "Plano criado",
        description: "O plano foi criado com sucesso",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao criar plano",
        description: "Tente novamente",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest('PUT', `/api/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso",
      });
      setIsDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: "Tente novamente",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/plans/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir plano");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir plano",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      vacancyQuantity: "",
      features: "",
      isActive: "true",
    });
  };

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: formatCurrency((parseFloat(plan.price) * 100).toString()),
        vacancyQuantity: plan.vacancyQuantity,
        features: plan.features,
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Desformata o preço antes de enviar (converte R$ 1.234,56 para 1234.56)
    const unformattedPrice = unformatCurrency(formData.price);
    const priceInReais = (parseInt(unformattedPrice) / 100).toString();
    
    const dataToSubmit = {
      ...formData,
      price: priceInReais,
    };
    
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: dataToSubmit });
    } else {
      createPlanMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      deletePlanMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => handleOpenDialog()}
          data-testid="button-create-plan"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      R$ {plan.price} - {plan.vacancyQuantity} vagas
                    </CardDescription>
                  </div>
                  <Badge variant={plan.isActive === 'true' ? 'default' : 'secondary'}>
                    {plan.isActive === 'true' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Benefícios:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {plan.features}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(plan)}
                    data-testid={`button-edit-plan-${plan.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    data-testid={`button-delete-plan-${plan.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum plano cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece criando seu primeiro plano
          </p>
          <Button onClick={() => handleOpenDialog()} data-testid="button-create-first-plan">
            <Plus className="h-4 w-4 mr-2" />
            Criar Plano
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do plano
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Plano Básico"
                required
                data-testid="input-plan-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o plano"
                required
                data-testid="input-plan-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="R$ 0,00"
                  required
                  data-testid="input-plan-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacancyQuantity">Quantidade de Vagas *</Label>
                <Input
                  id="vacancyQuantity"
                  value={formData.vacancyQuantity}
                  onChange={(e) => setFormData({ ...formData, vacancyQuantity: e.target.value })}
                  placeholder="Ex: 10"
                  required
                  data-testid="input-plan-vacancy-quantity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Benefícios *</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Liste os benefícios, um por linha"
                rows={5}
                required
                data-testid="input-plan-features"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status *</Label>
              <Select
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
              >
                <SelectTrigger data-testid="select-plan-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                data-testid="button-submit"
              >
                {createPlanMutation.isPending || updatePlanMutation.isPending
                  ? "Salvando..."
                  : editingPlan
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
