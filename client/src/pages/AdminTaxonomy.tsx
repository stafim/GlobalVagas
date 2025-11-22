import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tags, Briefcase, FileText, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isActive: string;
  createdAt: string;
}

const tagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.string(),
});

type TagFormData = z.infer<typeof tagSchema>;

export default function AdminTaxonomy() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const { data: tags, isLoading } = useQuery<Tag[]>({
    queryKey: ['/api/admin/tags'],
  });

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#6366f1",
      isActive: "true",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TagFormData) => {
      return await apiRequest('/api/admin/tags', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      toast({
        title: "Sucesso",
        description: "Tag criada com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tag",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TagFormData }) => {
      return await apiRequest(`/api/admin/tags/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      toast({
        title: "Sucesso",
        description: "Tag atualizada com sucesso",
      });
      setIsDialogOpen(false);
      setEditingTag(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tag",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/tags/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      toast({
        title: "Sucesso",
        description: "Tag deletada com sucesso",
      });
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar tag",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TagFormData) => {
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
      color: tag.color || "#6366f1",
      isActive: tag.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleNewTag = () => {
    setEditingTag(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      color: "#6366f1",
      isActive: "true",
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <Tags className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Taxonomia</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as classificações e categorias do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="tags" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tags" data-testid="tab-tags">
            <Tags className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="tipos-trabalho" data-testid="tab-work-types">
            <Briefcase className="h-4 w-4 mr-2" />
            Tipos de Trabalho
          </TabsTrigger>
          <TabsTrigger value="tipos-contrato" data-testid="tab-contract-types">
            <FileText className="h-4 w-4 mr-2" />
            Tipos de Contrato
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Gerencie as tags disponíveis no sistema
                  </CardDescription>
                </div>
                <Button onClick={handleNewTag} data-testid="button-new-tag">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !tags || tags.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tag cadastrada</p>
                  <p className="text-sm mt-2">Clique em "Nova Tag" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id} data-testid={`row-tag-${tag.id}`}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                          {tag.description || "-"}
                        </TableCell>
                        <TableCell>
                          {tag.color && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-xs text-muted-foreground">{tag.color}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tag.isActive === 'true' ? 'default' : 'secondary'}>
                            {tag.isActive === 'true' ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(tag)}
                              data-testid={`button-edit-tag-${tag.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(tag)}
                              data-testid={`button-delete-tag-${tag.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos-trabalho" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Trabalho</CardTitle>
              <CardDescription>
                Configure os tipos de trabalho disponíveis para as vagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuração de tipos de trabalho em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos-contrato" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Contrato</CardTitle>
              <CardDescription>
                Configure os tipos de contrato disponíveis para as vagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuração de tipos de contrato em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Create/Edit Tag */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-tag-form">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Editar Tag' : 'Nova Tag'}
            </DialogTitle>
            <DialogDescription>
              {editingTag ? 'Atualize as informações da tag' : 'Preencha os dados da nova tag'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome da tag"
                        data-testid="input-tag-name"
                        onChange={(e) => {
                          field.onChange(e);
                          if (!editingTag) {
                            form.setValue('slug', generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="slug-da-tag"
                        data-testid="input-tag-slug"
                      />
                    </FormControl>
                    <FormDescription>
                      URL amigável (gerada automaticamente)
                    </FormDescription>
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
                        {...field}
                        placeholder="Descrição da tag (opcional)"
                        rows={3}
                        data-testid="input-tag-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          {...field}
                          className="w-20 h-10"
                          data-testid="input-tag-color"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Tag Ativa
                      </FormLabel>
                      <FormDescription>
                        Tags ativas ficam visíveis no sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'true'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'true' : 'false')}
                        data-testid="switch-tag-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-tag"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-tag"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTag ? 'Salvar Alterações' : 'Criar Tag'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag "{tagToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tagToDelete && deleteMutation.mutate(tagToDelete.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
