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
import { Calendar, Plus, MapPin, DollarSign, Users, Trash2, Upload, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event, InsertEvent } from "@shared/schema";
import { insertEventSchema } from "@shared/schema";
import { useState, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const BRAZILIAN_CITIES_BY_STATE: Record<string, string[]> = {
  "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"],
  "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo"],
  "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque"],
  "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
  "DF": ["Brasília"],
  "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim"],
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"],
  "MA": ["São Luís", "Imperatriz", "Caxias", "Timon", "Codó"],
  "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
  "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga"],
  "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal"],
  "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu"],
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano"],
  "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "Campos dos Goytacazes", "Petrópolis"],
  "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo"],
  "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
  "RR": ["Boa Vista", "Rorainópolis", "Caracaraí", "São João da Baliza"],
  "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí"],
  "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Santos", "Mauá", "São José do Rio Preto", "Piracicaba", "Bauru"],
  "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância"],
  "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
};

const formSchema = insertEventSchema;

export default function AdminEvents() {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      endDate: "",
      location: "",
      address: "",
      city: "",
      state: "",
      country: "Brasil",
      isFree: "true",
      price: "",
      coverImageUrl: "",
      organizerName: "",
      organizerEmail: "",
      organizerPhone: "",
      website: "",
      capacity: "",
      category: "",
      isActive: "true",
    },
  });

  const selectedState = form.watch("state");

  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    return BRAZILIAN_CITIES_BY_STATE[selectedState] || [];
  }, [selectedState]);

  const { data: eventsData, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    retry: false,
    enabled: userType === 'admin',
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      const response = await apiRequest('POST', '/api/events', eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Evento criado!",
        description: "O evento foi cadastrado com sucesso.",
      });
      setIsDialogOpen(false);
      setEditingEvent(null);
      form.reset();
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar evento",
        description: error.message,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEvent> }) => {
      const response = await apiRequest('PATCH', `/api/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Evento atualizado!",
        description: "O evento foi atualizado com sucesso.",
      });
      setIsDialogOpen(false);
      setEditingEvent(null);
      form.reset();
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar evento",
        description: error.message,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Evento excluído",
        description: "O evento foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir evento",
        description: error.message,
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCover = async (eventId: string) => {
    if (!selectedFile) return null;

    try {
      setUploadingCover(true);
      
      const uploadResponse = await apiRequest('POST', '/api/events/upload-cover');
      const { uploadURL } = await uploadResponse.json();

      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const setCoverResponse = await apiRequest('POST', '/api/events/set-cover', {
        coverURL: uploadURL
      });
      const { objectPath } = await setCoverResponse.json();

      await apiRequest('PATCH', `/api/events/${eventId}`, {
        coverImageUrl: objectPath
      });

      return objectPath;
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer upload da imagem",
      });
      return null;
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const eventData = { ...values };
    
    if (editingEvent) {
      await updateEventMutation.mutateAsync({ id: editingEvent.id, data: eventData });
      
      if (selectedFile) {
        await handleUploadCover(editingEvent.id);
        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      }
    } else {
      const createdEvent = await createEventMutation.mutateAsync(eventData);
      
      if (selectedFile && createdEvent) {
        await handleUploadCover(createdEvent.id);
        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      endDate: event.endDate || "",
      location: event.location,
      address: event.address,
      city: event.city,
      state: event.state,
      country: event.country,
      isFree: event.isFree,
      price: event.price || "",
      coverImageUrl: event.coverImageUrl || "",
      organizerName: event.organizerName,
      organizerEmail: event.organizerEmail,
      organizerPhone: event.organizerPhone || "",
      website: event.website || "",
      capacity: event.capacity || "",
      category: event.category || "",
      isActive: event.isActive,
    });
    if (event.coverImageUrl) {
      setPreviewUrl(event.coverImageUrl.startsWith('/objects') ? event.coverImageUrl : `/objects${event.coverImageUrl}`);
    }
    setIsDialogOpen(true);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    form.reset();
    setSelectedFile(null);
    setPreviewUrl("");
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={handleNewEvent} data-testid="button-new-event">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
            form.reset();
            setSelectedFile(null);
            setPreviewUrl("");
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Atualize as informações do evento" : "Cadastre uma nova feira ou evento"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Imagem de Capa</h3>
                  <div className="space-y-3">
                    {previewUrl ? (
                      <div className="relative">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="cover-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {previewUrl ? "Trocar Imagem" : "Selecionar Imagem"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Informações do Evento</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Título do Evento*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: ExpoMining 2024" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Descrição*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrição completa do evento"
                              {...field}
                              className="resize-none"
                              rows={4}
                              data-testid="input-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Feira, Workshop" {...field} value={field.value || ""} data-testid="input-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 5000 pessoas" {...field} value={field.value || ""} data-testid="input-capacity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-event-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Expiração</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} data-testid="input-end-date" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Após esta data, o evento ficará automaticamente invisível para os usuários
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Localização</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Local*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Centro de Convenções" {...field} data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço*</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("city", "");
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BRAZILIAN_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedState}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-city">
                                <SelectValue placeholder={selectedState ? "Selecione a cidade" : "Selecione o estado primeiro"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País*</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Valores</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-is-free">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Gratuito</SelectItem>
                              <SelectItem value="false">Pago</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: R$ 150,00" {...field} value={field.value || ""} data-testid="input-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Organizador</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="organizerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome*</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do organizador" {...field} data-testid="input-organizer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@evento.com" {...field} data-testid="input-organizer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} data-testid="input-organizer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://evento.com.br" {...field} value={field.value || ""} data-testid="input-website" />
                          </FormControl>
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
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending || updateEventMutation.isPending || uploadingCover}
                    data-testid="button-save"
                  >
                    {(createEventMutation.isPending || updateEventMutation.isPending || uploadingCover) 
                      ? "Salvando..." 
                      : (editingEvent ? "Atualizar Evento" : "Cadastrar Evento")}
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
                Total de Eventos
              </CardTitle>
              <CardDescription>Eventos cadastrados</CardDescription>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-events">
              {isLoading ? <Skeleton className="h-10 w-20" /> : eventsData?.length || 0}
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
      ) : eventsData && eventsData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsData.map((event) => (
            <Card key={event.id} data-testid={`card-event-${event.id}`} className="hover-elevate overflow-hidden">
              {event.coverImageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.coverImageUrl.startsWith('/objects') ? event.coverImageUrl : `/objects${event.coverImageUrl}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg" data-testid={`text-event-title-${event.id}`}>
                    {event.title}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEvent(event)}
                      data-testid={`button-edit-event-${event.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este evento?")) {
                          deleteEventMutation.mutate(event.id);
                        }
                      }}
                      data-testid={`button-delete-event-${event.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  {event.endDate && (
                    <div className="text-xs text-muted-foreground ml-6">
                      Expira em: {formatDate(event.endDate)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.city}, {event.state}</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.capacity}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={event.isFree === "true" ? "default" : "secondary"}>
                    {event.isFree === "true" ? "Gratuito" : event.price || "Pago"}
                  </Badge>
                  <Badge variant={event.isActive === "true" ? "default" : "outline"}>
                    {event.isActive === "true" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum evento cadastrado ainda. Comece criando um novo evento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
