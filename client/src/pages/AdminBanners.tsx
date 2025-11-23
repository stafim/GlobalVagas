import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
import { Image as ImageIcon, Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Banner, InsertBanner } from "@shared/schema";
import { insertBannerSchema } from "@shared/schema";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = insertBannerSchema;

export default function AdminBanners() {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      displayOrder: "0",
      isActive: "true",
    },
  });

  const { data: bannersData, isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
    retry: false,
    enabled: userType === 'admin',
  });

  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: InsertBanner) => {
      const response = await apiRequest('POST', '/api/banners', bannerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners/active'] });
      toast({
        title: "Banner criado!",
        description: "O banner foi cadastrado com sucesso.",
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar banner",
        description: error.message,
      });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBanner> }) => {
      const response = await apiRequest('PATCH', `/api/banners/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners/active'] });
      toast({
        title: "Banner atualizado!",
        description: "O banner foi atualizado com sucesso.",
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar banner",
        description: error.message,
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners/active'] });
      toast({
        title: "Banner excluído!",
        description: "O banner foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir banner",
        description: error.message,
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const uploadResponse = await apiRequest("POST", "/api/banners/upload-image");
      const { uploadURL, useLocal } = await uploadResponse.json();

      if (useLocal) {
        const formData = new FormData();
        formData.append('file', file);

        const localUploadResponse = await fetch(uploadURL, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!localUploadResponse.ok) {
          throw new Error('Upload local falhou');
        }

        const { filePath } = await localUploadResponse.json();
        form.setValue('imageUrl', filePath);
        setPreviewUrl(filePath);
      } else {
        const uploadResult = await fetch(uploadURL, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResult.ok) {
          throw new Error('Upload failed');
        }

        const setImageResponse = await apiRequest('POST', '/api/banners/set-image', {
          imageURL: uploadURL
        });
        const { objectPath } = await setImageResponse.json();

        form.setValue('imageUrl', objectPath);
        setPreviewUrl(objectPath.startsWith('/objects') ? objectPath : `/objects${objectPath}`);
      }

      toast({
        title: "Imagem carregada!",
        description: "A imagem foi carregada com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer upload da imagem.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data });
    } else {
      createBannerMutation.mutate(data);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      displayOrder: banner.displayOrder || "0",
      isActive: banner.isActive,
    });
    if (banner.imageUrl) {
      setPreviewUrl(banner.imageUrl.startsWith('/objects') ? banner.imageUrl : `/objects${banner.imageUrl}`);
    }
    setIsDialogOpen(true);
  };

  const handleNewBanner = () => {
    setEditingBanner(null);
    form.reset({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      displayOrder: "0",
      isActive: "true",
    });
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setPreviewUrl(null);
    form.reset();
  };

  if (userType !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Acesso negado. Esta página é apenas para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-admin-banners">
            Banners da Home
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os banners exibidos na seção "Explore por Categoria" da página inicial
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBanner} data-testid="button-new-banner">
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </DialogTitle>
              <DialogDescription>
                {editingBanner 
                  ? 'Atualize as informações do banner abaixo.'
                  : 'Preencha as informações do novo banner abaixo.'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Imagem do Banner</h3>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      data-testid="button-upload-image"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Fazendo upload...' : 'Selecionar Imagem'}
                    </Button>
                    {previewUrl && (
                      <div className="mt-3 border rounded-md overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informações do Banner</h3>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Tecnologia" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 12.500 vagas" {...field} value={field.value || ""} data-testid="input-subtitle" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link (URL)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} data-testid="input-link-url" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Link para onde o banner deve redirecionar quando clicado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem de Exibição*</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} data-testid="input-display-order" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Banners com menor número aparecem primeiro
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-is-active">
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
                  </div>
                </div>

                <DialogFooter>
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
                    disabled={createBannerMutation.isPending || updateBannerMutation.isPending || uploadingImage}
                    data-testid="button-save"
                  >
                    {(createBannerMutation.isPending || updateBannerMutation.isPending || uploadingImage) 
                      ? "Salvando..." 
                      : (editingBanner ? "Atualizar Banner" : "Cadastrar Banner")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Total de Banners
              </CardTitle>
              <CardDescription>Banners cadastrados</CardDescription>
            </div>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-banners">
              {isLoading ? <Skeleton className="h-10 w-20" /> : bannersData?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : bannersData && bannersData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bannersData.map((banner) => (
            <Card key={banner.id} data-testid={`card-banner-${banner.id}`} className="hover-elevate overflow-hidden">
              {banner.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={banner.imageUrl.startsWith('/objects') ? banner.imageUrl : `/objects${banner.imageUrl}`}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-banner-title-${banner.id}`}>
                      {banner.title}
                    </CardTitle>
                    {banner.subtitle && (
                      <CardDescription className="mt-1">
                        {banner.subtitle}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditBanner(banner)}
                      data-testid={`button-edit-banner-${banner.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este banner?")) {
                          deleteBannerMutation.mutate(banner.id);
                        }
                      }}
                      data-testid={`button-delete-banner-${banner.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {banner.linkUrl && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{banner.linkUrl}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary">
                    Ordem: {banner.displayOrder}
                  </Badge>
                  <Badge variant={banner.isActive === "true" ? "default" : "outline"}>
                    {banner.isActive === "true" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum banner cadastrado ainda. Comece criando um novo banner.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
