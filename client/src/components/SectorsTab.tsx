import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Layers, Plus, Trash2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Sector, Subsector, InsertSector, InsertSubsector } from "@shared/schema";
import { insertSectorSchema, insertSubsectorSchema } from "@shared/schema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const sectorFormSchema = insertSectorSchema;
const subsectorFormSchema = insertSubsectorSchema;

export default function SectorsTab() {
  const { toast } = useToast();
  const [isSectorDialogOpen, setIsSectorDialogOpen] = useState(false);
  const [isSubsectorDialogOpen, setIsSubsectorDialogOpen] = useState(false);

  const sectorForm = useForm<z.infer<typeof sectorFormSchema>>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: "true",
    },
  });

  const subsectorForm = useForm<z.infer<typeof subsectorFormSchema>>({
    resolver: zodResolver(subsectorFormSchema),
    defaultValues: {
      sectorId: "",
      name: "",
      description: "",
      isActive: "true",
    },
  });

  const { data: sectorsData, isLoading: sectorsLoading } = useQuery<Sector[]>({
    queryKey: ['/api/sectors'],
  });

  const { data: subsectorsData, isLoading: subsectorsLoading } = useQuery<Subsector[]>({
    queryKey: ['/api/subsectors'],
  });

  const createSectorMutation = useMutation({
    mutationFn: async (sectorData: InsertSector) => {
      const response = await apiRequest('POST', '/api/sectors', sectorData);
      if (!response.ok) {
        throw new Error('Erro ao criar setor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sectors'] });
      toast({
        title: "Setor criado!",
        description: "O setor foi cadastrado com sucesso.",
      });
      setIsSectorDialogOpen(false);
      sectorForm.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao criar setor",
      });
    },
  });

  const createSubsectorMutation = useMutation({
    mutationFn: async (subsectorData: InsertSubsector) => {
      const response = await apiRequest('POST', '/api/subsectors', subsectorData);
      if (!response.ok) {
        throw new Error('Erro ao criar subsetor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsectors'] });
      toast({
        title: "Subsetor criado!",
        description: "O subsetor foi cadastrado com sucesso.",
      });
      setIsSubsectorDialogOpen(false);
      subsectorForm.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao criar subsetor",
      });
    },
  });

  const deleteSectorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/sectors/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao excluir setor');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sectors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subsectors'] });
      toast({
        title: "Setor excluído",
        description: "O setor foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir setor",
      });
    },
  });

  const deleteSubsectorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/subsectors/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao excluir subsetor');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsectors'] });
      toast({
        title: "Subsetor excluído",
        description: "O subsetor foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir subsetor",
      });
    },
  });

  const handleSectorSubmit = async (values: z.infer<typeof sectorFormSchema>) => {
    createSectorMutation.mutate(values);
  };

  const handleSubsectorSubmit = async (values: z.infer<typeof subsectorFormSchema>) => {
    createSubsectorMutation.mutate(values);
  };

  const getSectorSubsectors = (sectorId: string) => {
    return subsectorsData?.filter(sub => sub.sectorId === sectorId) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dialog open={isSectorDialogOpen} onOpenChange={setIsSectorDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-sector">
                <Plus className="h-4 w-4 mr-2" />
                Novo Setor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Setor</DialogTitle>
                <DialogDescription>
                  Cadastre um novo setor de atuação
                </DialogDescription>
              </DialogHeader>
              <Form {...sectorForm}>
                <form onSubmit={sectorForm.handleSubmit(handleSectorSubmit)} className="space-y-4">
                  <FormField
                    control={sectorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Setor*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mineração" {...field} data-testid="input-sector-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sectorForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do setor"
                            {...field}
                            value={field.value || ""}
                            rows={3}
                            data-testid="input-sector-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sectorForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sector-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsSectorDialogOpen(false)}
                      data-testid="button-cancel-sector"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSectorMutation.isPending}
                      data-testid="button-save-sector"
                    >
                      {createSectorMutation.isPending ? "Salvando..." : "Cadastrar Setor"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isSubsectorDialogOpen} onOpenChange={setIsSubsectorDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-new-subsector">
                <Plus className="h-4 w-4 mr-2" />
                Novo Subsetor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Subsetor</DialogTitle>
                <DialogDescription>
                  Cadastre um novo subsetor vinculado a um setor
                </DialogDescription>
              </DialogHeader>
              <Form {...subsectorForm}>
                <form onSubmit={subsectorForm.handleSubmit(handleSubsectorSubmit)} className="space-y-4">
                  <FormField
                    control={subsectorForm.control}
                    name="sectorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sector">
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectorsData?.map((sector) => (
                              <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsectorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Subsetor*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Extração de Minério" {...field} data-testid="input-subsector-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsectorForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do subsetor"
                            {...field}
                            value={field.value || ""}
                            rows={3}
                            data-testid="input-subsector-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsectorForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-subsector-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsSubsectorDialogOpen(false)}
                      data-testid="button-cancel-subsector"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSubsectorMutation.isPending}
                      data-testid="button-save-subsector"
                    >
                      {createSubsectorMutation.isPending ? "Salvando..." : "Cadastrar Subsetor"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Total de Setores
              </CardTitle>
              <CardDescription>Setores cadastrados no sistema</CardDescription>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-sectors">
              {sectorsLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                sectorsData?.length || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Total de Subsetores
              </CardTitle>
              <CardDescription>Subsetores cadastrados no sistema</CardDescription>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-subsectors">
              {subsectorsLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                subsectorsData?.length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {sectorsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sectorsData && sectorsData.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-3">
          {sectorsData.map((sector) => {
            const subsectors = getSectorSubsectors(sector.id);
            return (
              <AccordionItem 
                key={sector.id} 
                value={sector.id}
                className="border rounded-lg px-4"
                data-testid={`accordion-sector-${sector.id}`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <h3 className="font-semibold" data-testid={`text-sector-name-${sector.id}`}>
                          {sector.name}
                        </h3>
                        {sector.description && (
                          <p className="text-sm text-muted-foreground">{sector.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sector.isActive === "true" ? "default" : "secondary"}>
                        {sector.isActive === "true" ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        {subsectors.length} {subsectors.length === 1 ? 'subsetor' : 'subsetores'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Tem certeza que deseja excluir este setor?")) {
                            deleteSectorMutation.mutate(sector.id);
                          }
                        }}
                        data-testid={`button-delete-sector-${sector.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {subsectors.length > 0 ? (
                    <div className="space-y-2">
                      {subsectors.map((subsector) => (
                        <div
                          key={subsector.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                          data-testid={`card-subsector-${subsector.id}`}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium" data-testid={`text-subsector-name-${subsector.id}`}>
                              {subsector.name}
                            </h4>
                            {subsector.description && (
                              <p className="text-sm text-muted-foreground">{subsector.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subsector.isActive === "true" ? "default" : "secondary"}>
                              {subsector.isActive === "true" ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir este subsetor?")) {
                                  deleteSubsectorMutation.mutate(subsector.id);
                                }
                              }}
                              data-testid={`button-delete-subsector-${subsector.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum subsetor cadastrado neste setor
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum setor cadastrado ainda. Comece criando um novo setor.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
