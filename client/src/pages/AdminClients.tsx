import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Globe, Briefcase, Users as UsersIcon, Search, Plus, Upload, Palette, Eye, Edit, Camera, ShoppingCart } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company, Client, InsertClient } from "@shared/schema";

type ClientWithSource = Client & {
  source: 'admin_client' | 'registered_company';
};
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { z } from "zod";
import { Label } from "@/components/ui/label";

const formSchema = insertClientSchema.extend({
  logoUrl: z.string().optional(),
});

export default function AdminClients() {
  const { userType } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchName, setSearchName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithSource | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPurchasesDialogOpen, setIsPurchasesDialogOpen] = useState(false);
  const [selectedClientPurchases, setSelectedClientPurchases] = useState<any[]>([]);
  const [editingLogoClientId, setEditingLogoClientId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      email: "",
      phone: "",
      website: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      primaryColor: "#8b5cf6",
      secondaryColor: "#a78bfa",
      accentColor: "#c4b5fd",
      isActive: "true",
    },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      email: "",
      phone: "",
      website: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      primaryColor: "#8b5cf6",
      secondaryColor: "#a78bfa",
      accentColor: "#c4b5fd",
      isActive: "true",
    },
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery<ClientWithSource[]>({
    queryKey: ['/api/clients'],
    retry: false,
    enabled: userType === 'admin',
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertClient) => {
      const response = await apiRequest('POST', '/api/clients', clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente criado!",
        description: "O cliente foi cadastrado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar cliente",
        description: error.message,
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertClient> }) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente atualizado!",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: error.message,
      });
    },
  });

  const updateClientLogoMutation = useMutation({
    mutationFn: async ({ clientId, logoUrl }: { clientId: string; logoUrl: string }) => {
      const response = await apiRequest('PUT', `/api/clients/${clientId}`, { logoUrl });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Logo atualizado!",
        description: "O logo do cliente foi atualizado com sucesso.",
      });
      setEditingLogoClientId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar logo",
        description: error.message,
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClientLogoUpload = async (clientId: string, file: File) => {
    try {
      const uploadResponse = await apiRequest('POST', '/api/clients/upload-logo');
      const { uploadURL } = await uploadResponse.json();
      
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Falha ao fazer upload da logo');
      }

      const url = new URL(uploadURL);
      const logoUrl = url.pathname;

      updateClientLogoMutation.mutate({ clientId, logoUrl });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da logo",
        description: "Tente novamente",
      });
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    let logoUrl = values.logoUrl || "";
    
    if (logoFile) {
      try {
        const uploadResponse = await apiRequest('POST', '/api/clients/upload-logo');
        const { uploadURL } = await uploadResponse.json();
        
        const uploadResult = await fetch(uploadURL, {
          method: 'PUT',
          body: logoFile,
          headers: {
            'Content-Type': logoFile.type,
          },
        });

        if (!uploadResult.ok) {
          throw new Error('Falha ao fazer upload da logo');
        }

        const url = new URL(uploadURL);
        logoUrl = url.pathname;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer upload da logo",
          description: "Tente novamente",
        });
        return;
      }
    }

    createClientMutation.mutate({
      ...values,
      logoUrl,
    });
  };

  useEffect(() => {
    if (isEditDialogOpen && selectedClient) {
      editForm.reset({
        companyName: selectedClient.companyName,
        cnpj: selectedClient.cnpj,
        email: selectedClient.email,
        phone: selectedClient.phone,
        website: selectedClient.website || "",
        contactName: selectedClient.contactName || "",
        contactEmail: selectedClient.contactEmail || "",
        contactPhone: selectedClient.contactPhone || "",
        logoUrl: selectedClient.logoUrl || "",
        primaryColor: selectedClient.primaryColor,
        secondaryColor: selectedClient.secondaryColor,
        accentColor: selectedClient.accentColor,
        isActive: selectedClient.isActive ? "true" : "false",
      });
    }
  }, [isEditDialogOpen, selectedClient, editForm]);

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedClient) return;
    
    const { logoUrl, ...restValues } = values;
    
    updateClientMutation.mutate({
      id: selectedClient.id,
      data: restValues,
    });
  };

  const filteredClients = useMemo(() => {
    if (!clientsData) return [];
    
    return clientsData.filter((client) => {
      const matchesName = !searchName || 
        client.companyName.toLowerCase().includes(searchName.toLowerCase());
      
      return matchesName;
    });
  }, [clientsData, searchName]);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-client">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo cliente com suas informações e esquema de cores personalizado
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Informações da Empresa</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da Empresa*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Mineradora XYZ" {...field} data-testid="input-company-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CNPJ*</FormLabel>
                                <FormControl>
                                  <Input placeholder="00.000.000/0000-00" {...field} data-testid="input-cnpj" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email da Empresa*</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="contato@empresa.com" {...field} data-testid="input-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone*</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 0000-0000" {...field} data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.empresa.com" {...field} value={field.value || ""} data-testid="input-website" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Informações de Contato</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="contactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Contato*</FormLabel>
                                <FormControl>
                                  <Input placeholder="João Silva" {...field} data-testid="input-contact-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email do Contato*</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="joao@empresa.com" {...field} data-testid="input-contact-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone do Contato*</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" {...field} data-testid="input-contact-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Logo da Empresa</h3>
                        <div className="space-y-3">
                          <Label htmlFor="logo-upload">Logo</Label>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            data-testid="input-logo-upload"
                          />
                          {logoPreview && (
                            <div className="mt-3">
                              <img src={logoPreview} alt="Preview" className="h-24 w-24 object-contain rounded-md border" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Esquema de Cores Personalizado
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Defina as cores que aparecerão quando o cliente fizer login na plataforma
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Primária</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-primary-color" />
                                    <Input {...field} placeholder="#8b5cf6" className="flex-1" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Secundária</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-secondary-color" />
                                    <Input {...field} placeholder="#a78bfa" className="flex-1" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="accentColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor de Destaque</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-accent-color" />
                                    <Input {...field} placeholder="#c4b5fd" className="flex-1" />
                                  </div>
                                </FormControl>
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
                          onClick={() => setIsDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createClientMutation.isPending}
                          data-testid="button-submit-client"
                        >
                          {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Total de Clientes
                    </CardTitle>
                    <CardDescription>Empresas cadastradas na plataforma</CardDescription>
                  </div>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-total-clients">
                    {clientsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      clientsData?.length || 0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Filtros
                    </CardTitle>
                    <CardDescription>Buscar empresas por nome</CardDescription>
                  </div>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome da empresa..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-name"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {clientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <Card key={client.id} data-testid={`card-client-${client.id}`} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-md p-3 overflow-hidden">
                            {client.logoUrl ? (
                              <img 
                                src={`${client.logoUrl}?t=${Date.now()}`}
                                alt={`${client.companyName} logo`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '';
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Building2 className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/clients/upload-logo");
                              const data = await response.json();
                              return {
                                method: 'PUT' as const,
                                url: data.uploadURL,
                              };
                            }}
                            onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                              if (result.successful && result.successful.length > 0) {
                                const uploadURL = result.successful[0].uploadURL;
                                try {
                                  const setLogoResponse = await apiRequest('POST', '/api/clients/set-logo', {
                                    logoURL: uploadURL
                                  });
                                  const { objectPath } = await setLogoResponse.json();
                                  
                                  await apiRequest('PUT', `/api/clients/${client.id}`, {
                                    logoUrl: objectPath
                                  });
                                  
                                  queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
                                  toast({
                                    title: "Logo atualizado!",
                                    description: "O logo foi atualizado com sucesso.",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Erro ao atualizar logo",
                                    description: "Ocorreu um erro ao salvar o logo. Tente novamente.",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                            buttonClassName="h-8 gap-2"
                          >
                            <Camera className="h-3 w-3" />
                            {client.logoUrl ? "Trocar" : "Adicionar"}
                          </ObjectUploader>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold truncate" data-testid={`text-client-name-${client.id}`}>
                                {client.companyName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                CNPJ: {client.cnpj}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={client.isActive === 'true' ? "default" : "secondary"}>
                                {client.isActive === 'true' ? "Ativo" : "Inativo"}
                              </Badge>
                              {client.source === 'registered_company' && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  Cadastro Site
                                </Badge>
                              )}
                              <Button 
                                size="icon" 
                                variant="ghost"
                                data-testid={`button-view-${client.id}`}
                                title="Visualizar detalhes"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {client.source === 'admin_client' && (
                                <>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    data-testid={`button-purchases-${client.id}`}
                                    title="Ver compras"
                                    onClick={async () => {
                                      setSelectedClient(client);
                                      try {
                                        const response = await apiRequest('GET', `/api/clients/${client.id}/purchases`);
                                        const purchases = await response.json();
                                        setSelectedClientPurchases(purchases);
                                        setIsPurchasesDialogOpen(true);
                                      } catch (error) {
                                        toast({
                                          title: "Erro ao carregar compras",
                                          description: "Não foi possível carregar as compras deste cliente.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    data-testid={`button-edit-${client.id}`}
                                    title="Editar cliente"
                                    onClick={() => {
                                      setSelectedClient(client);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>

                            {client.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a 
                                  href={client.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="truncate text-primary hover:underline"
                                >
                                  {client.website}
                                </a>
                              </div>
                            )}

                            {client.contactName && (
                              <div className="flex items-center gap-2 text-sm">
                                <UsersIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{client.contactName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : clientsData && clientsData.length > 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    Nenhum cliente encontrado com este filtro
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchName("")}
                    className="mt-4"
                    data-testid="button-clear-filters"
                  >
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    Nenhuma empresa cadastrada ainda
                  </p>
                </CardContent>
              </Card>
            )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {selectedClient.logoUrl && (
                <div className="flex justify-center pb-4 border-b">
                  <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-md p-4">
                    <img 
                      src={selectedClient.logoUrl} 
                      alt={`${selectedClient.companyName} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome da Empresa</Label>
                    <p className="font-medium">{selectedClient.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CNPJ</Label>
                    <p className="font-medium">{selectedClient.cnpj}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{selectedClient.phone}</p>
                  </div>
                </div>

                {selectedClient.website && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <a 
                      href={selectedClient.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline block"
                    >
                      {selectedClient.website}
                    </a>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Contato</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClient.contactName && (
                      <div>
                        <Label className="text-muted-foreground">Nome do Contato</Label>
                        <p className="font-medium">{selectedClient.contactName}</p>
                      </div>
                    )}
                    {selectedClient.contactEmail && (
                      <div>
                        <Label className="text-muted-foreground">Email do Contato</Label>
                        <p className="font-medium">{selectedClient.contactEmail}</p>
                      </div>
                    )}
                    {selectedClient.contactPhone && (
                      <div>
                        <Label className="text-muted-foreground">Telefone do Contato</Label>
                        <p className="font-medium">{selectedClient.contactPhone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Cores da Marca</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Cor Primária</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: selectedClient.primaryColor }}
                        />
                        <span className="text-sm font-mono">{selectedClient.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cor Secundária</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: selectedClient.secondaryColor }}
                        />
                        <span className="text-sm font-mono">{selectedClient.secondaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cor de Destaque</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: selectedClient.accentColor }}
                        />
                        <span className="text-sm font-mono">{selectedClient.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedClient.isActive ? "default" : "secondary"} className="mt-1">
                    {selectedClient.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informações da Empresa</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Mineradora XYZ" {...field} data-testid="input-edit-company-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ*</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} data-testid="input-edit-cnpj" disabled />
                          </FormControl>
                          <FormDescription>CNPJ não pode ser alterado</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email da Empresa*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@empresa.com" {...field} data-testid="input-edit-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 0000-0000" {...field} data-testid="input-edit-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.empresa.com" {...field} value={field.value || ""} data-testid="input-edit-website" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informações de Contato</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato*</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} data-testid="input-edit-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Contato*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="joao@empresa.com" {...field} data-testid="input-edit-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do Contato*</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} data-testid="input-edit-contact-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Esquema de Cores Personalizado
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={editForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-edit-primary-color" />
                              <Input {...field} placeholder="#8b5cf6" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-edit-secondary-color" />
                              <Input {...field} placeholder="#a78bfa" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor de Destaque</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-edit-accent-color" />
                              <Input {...field} placeholder="#c4b5fd" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Status</h3>
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status do Cliente</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="true"
                                checked={field.value === "true"}
                                onChange={field.onChange}
                                data-testid="input-edit-active"
                              />
                              <span>Ativo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="false"
                                checked={field.value === "false"}
                                onChange={field.onChange}
                                data-testid="input-edit-inactive"
                              />
                              <span>Inativo</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-edit-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateClientMutation.isPending}
                    data-testid="button-edit-save"
                  >
                    {updateClientMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPurchasesDialogOpen} onOpenChange={setIsPurchasesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compras do Cliente</DialogTitle>
            <DialogDescription>
              Histórico de compras e assinaturas de {selectedClient?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedClientPurchases.length > 0 ? (
              <div className="space-y-3">
                {selectedClientPurchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{purchase.planName}</h4>
                            <Badge variant={
                              purchase.status === 'active' ? 'default' : 
                              purchase.status === 'expired' ? 'secondary' : 
                              'outline'
                            }>
                              {purchase.status === 'active' ? 'Ativo' : 
                               purchase.status === 'expired' ? 'Expirado' : 
                               purchase.status}
                            </Badge>
                          </div>
                          {purchase.planDescription && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {purchase.planDescription}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Data de Compra</Label>
                              <p className="font-medium">
                                {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Data de Expiração</Label>
                              <p className="font-medium">
                                {new Date(purchase.expiryDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Valor</Label>
                              <p className="font-medium">{purchase.amount}</p>
                            </div>
                            {purchase.paymentMethod && (
                              <div>
                                <Label className="text-muted-foreground">Método de Pagamento</Label>
                                <p className="font-medium">{purchase.paymentMethod}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Este cliente ainda não realizou nenhuma compra
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchasesDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
