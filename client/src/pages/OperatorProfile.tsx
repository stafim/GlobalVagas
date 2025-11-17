import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  Calendar,
  Award,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  Camera
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Operator, Experience } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface City {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

function CitySelector({ value, onValueChange, disabled }: { value: string; onValueChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ['/ibge/cities'],
    queryFn: async () => {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
      return response.json();
    },
    staleTime: Infinity,
  });

  const filteredCities = cities?.filter(city => {
    if (!city.microrregiao?.mesorregiao?.UF?.sigla) return false;
    const searchLower = searchQuery.toLowerCase();
    const cityName = `${city.nome} - ${city.microrregiao.mesorregiao.UF.sigla}`.toLowerCase();
    return cityName.includes(searchLower);
  }).slice(0, 100) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
          data-testid="button-select-city"
        >
          {value || "Selecione uma cidade..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar cidade..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            data-testid="input-search-city"
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Carregando cidades...</CommandEmpty>
            ) : filteredCities.length === 0 ? (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredCities.map((city) => {
                  const cityLabel = `${city.nome} - ${city.microrregiao.mesorregiao.UF.sigla}`;
                  return (
                    <CommandItem
                      key={city.id}
                      value={cityLabel}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      data-testid={`city-option-${city.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === cityLabel ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cityLabel}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ExperiencesTab({ operatorId }: { operatorId?: string }) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    isCurrent: "false",
    description: "",
    location: "",
  });

  const { data: experiences, isLoading } = useQuery<Experience[]>({
    queryKey: ['/api/experiences', operatorId],
    enabled: !!operatorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/experiences", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences', operatorId] });
      toast({ title: "Experiência adicionada com sucesso!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar experiência", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/experiences/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences', operatorId] });
      toast({ title: "Experiência atualizada com sucesso!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar experiência", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences', operatorId] });
      toast({ title: "Experiência removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover experiência", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: "false",
      description: "",
      location: "",
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      isCurrent: exp.isCurrent,
      description: exp.description || "",
      location: exp.location || "",
    });
    setEditingId(exp.id);
    setIsAddingNew(true);
  };

  if (!operatorId) return null;

  if (isLoading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {!isAddingNew && (
        <Button onClick={() => setIsAddingNew(true)} className="w-full" data-testid="button-add-experience">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Experiência
        </Button>
      )}

      {isAddingNew && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar' : 'Nova'} Experiência</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Input
                    id="position"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    data-testid="input-position"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="month"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.isCurrent === 'true'}
                    data-testid="input-end-date"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={formData.isCurrent === 'true'}
                      onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked ? 'true' : 'false', endDate: e.target.checked ? '' : formData.endDate })}
                      className="h-4 w-4"
                      data-testid="checkbox-current"
                    />
                    <Label htmlFor="isCurrent" className="text-sm">Trabalho atual</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <CitySelector
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Descreva suas responsabilidades e conquistas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-experience">
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-experience">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {experiences && experiences.length > 0 ? (
          experiences.map((exp) => (
            <Card key={exp.id} data-testid={`experience-card-${exp.id}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{exp.position}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(exp.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {exp.isCurrent === 'true' ? 'Atual' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Presente'}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)} data-testid={`button-edit-${exp.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(exp.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${exp.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{exp.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma experiência cadastrada ainda.</p>
            <p className="text-sm">Adicione suas experiências profissionais para destacar seu perfil.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OperatorProfile() {
  const { toast } = useToast();
  const { user, userType, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  const operatorUser = user as Operator;
  
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    profession: "",
    experienceYears: "",
    certifications: "",
    availability: "",
    preferredLocation: "",
    workType: "",
    skills: "",
    bio: "",
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'operator')) {
      setLocation("/login");
      return;
    }

    if (operatorUser) {
      setProfileData({
        fullName: operatorUser.fullName || "",
        email: operatorUser.email || "",
        phone: operatorUser.phone || "",
        cpf: operatorUser.cpf || "",
        birthDate: operatorUser.birthDate || "",
        profession: operatorUser.profession || "",
        experienceYears: operatorUser.experienceYears?.toString() || "",
        certifications: operatorUser.certifications || "",
        availability: operatorUser.availability || "",
        preferredLocation: operatorUser.preferredLocation || "",
        workType: operatorUser.workType || "",
        skills: operatorUser.skills || "",
        bio: operatorUser.bio || "",
      });
    }
  }, [isLoading, isAuthenticated, userType, operatorUser, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/operators/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    if (operatorUser) {
      setProfileData({
        fullName: operatorUser.fullName || "",
        email: operatorUser.email || "",
        phone: operatorUser.phone || "",
        cpf: operatorUser.cpf || "",
        birthDate: operatorUser.birthDate || "",
        profession: operatorUser.profession || "",
        experienceYears: operatorUser.experienceYears?.toString() || "",
        certifications: operatorUser.certifications || "",
        availability: operatorUser.availability || "",
        preferredLocation: operatorUser.preferredLocation || "",
        workType: operatorUser.workType || "",
        skills: operatorUser.skills || "",
        bio: operatorUser.bio || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'operator') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground">
                Visualize e edite suas informações profissionais
              </p>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-cancel-edit"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Dados básicos e informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                  <Avatar className="h-32 w-32" data-testid="avatar-profile">
                    <AvatarImage 
                      src={operatorUser?.profilePhotoUrl || undefined} 
                      alt={profileData.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl">
                      {profileData.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880}
                    onGetUploadParameters={async () => {
                      const response = await apiRequest("POST", "/api/objects/upload");
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
                          await apiRequest("PUT", "/api/operators/profile-photo", {
                            profilePhotoURL: uploadURL,
                          });
                          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                          toast({
                            title: "Foto atualizada!",
                            description: "Sua foto de perfil foi atualizada com sucesso.",
                          });
                        } catch (error) {
                          toast({
                            title: "Erro ao atualizar foto",
                            description: "Ocorreu um erro ao salvar sua foto. Tente novamente.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    buttonClassName="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {operatorUser?.profilePhotoUrl ? "Trocar Foto" : "Adicionar Foto"}
                  </ObjectUploader>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        data-testid="input-edit-full-name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-full-name">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span>{profileData.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        data-testid="input-edit-email"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-email">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        data-testid="input-edit-phone"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-phone">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-cpf">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{profileData.cpf}</span>
                      <Badge variant="outline" className="ml-auto">Não editável</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    {isEditing ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                        data-testid="input-edit-birth-date"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-birth-date">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>{new Date(profileData.birthDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>
                  Experiência e qualificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="resumo" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="resumo" data-testid="tab-summary">Resumo</TabsTrigger>
                    <TabsTrigger value="experiencias" data-testid="tab-experiences">Experiências</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="resumo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão/Especialidade</Label>
                  {isEditing ? (
                    <Input
                      id="profession"
                      value={profileData.profession}
                      onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                      data-testid="input-edit-profession"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-profession">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <span>{profileData.profession}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Anos de Experiência</Label>
                  {isEditing ? (
                    <Select
                      value={profileData.experienceYears}
                      onValueChange={(value) => setProfileData({ ...profileData, experienceYears: value })}
                    >
                      <SelectTrigger data-testid="select-edit-experience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Menos de 1 ano</SelectItem>
                        <SelectItem value="1-3">1-3 anos</SelectItem>
                        <SelectItem value="3-5">3-5 anos</SelectItem>
                        <SelectItem value="5-10">5-10 anos</SelectItem>
                        <SelectItem value="10+">Mais de 10 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-experience">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <span>5-10 anos</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certificações</Label>
                  {isEditing ? (
                    <Textarea
                      id="certifications"
                      value={profileData.certifications}
                      onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                      rows={3}
                      data-testid="input-edit-certifications"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md" data-testid="text-certifications">
                      <p className="text-sm whitespace-pre-wrap">{profileData.certifications}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Habilidades</Label>
                  {isEditing ? (
                    <Textarea
                      id="skills"
                      value={profileData.skills}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                      rows={3}
                      data-testid="input-edit-skills"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md" data-testid="text-skills">
                      <p className="text-sm whitespace-pre-wrap">{profileData.skills}</p>
                    </div>
                  )}
                </div>
                  </TabsContent>

                  <TabsContent value="experiencias">
                    <ExperiencesTab operatorId={operatorUser?.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferências de Trabalho</CardTitle>
                <CardDescription>
                  Disponibilidade e localização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilidade</Label>
                    {isEditing ? (
                      <Select
                        value={profileData.availability}
                        onValueChange={(value) => setProfileData({ ...profileData, availability: value })}
                      >
                        <SelectTrigger data-testid="select-edit-availability">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imediato">Imediato</SelectItem>
                          <SelectItem value="15-dias">15 dias</SelectItem>
                          <SelectItem value="30-dias">30 dias</SelectItem>
                          <SelectItem value="60-dias">60 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-availability">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>30 dias</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType">Tipo de Trabalho</Label>
                    {isEditing ? (
                      <Select
                        value={profileData.workType}
                        onValueChange={(value) => setProfileData({ ...profileData, workType: value })}
                      >
                        <SelectTrigger data-testid="select-edit-work-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                          <SelectItem value="remoto">Remoto</SelectItem>
                          <SelectItem value="qualquer">Qualquer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-work-type">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <span>Presencial</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLocation">Localização Preferida</Label>
                  {isEditing ? (
                    <CitySelector
                      value={profileData.preferredLocation}
                      onValueChange={(value) => setProfileData({ ...profileData, preferredLocation: value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md" data-testid="text-location">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{profileData.preferredLocation || "Não informado"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sobre Você</CardTitle>
                <CardDescription>
                  Conte um pouco sobre sua trajetória profissional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  {isEditing ? (
                    <>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={5}
                        maxLength={1000}
                        data-testid="input-edit-bio"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {profileData.bio.length}/1000 caracteres
                      </p>
                    </>
                  ) : (
                    <div className="p-3 bg-muted rounded-md" data-testid="text-bio">
                      <p className="text-sm whitespace-pre-wrap">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-cancel-edit-bottom"
                >
                  <X className="mr-2 h-5 w-5" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile-bottom"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
