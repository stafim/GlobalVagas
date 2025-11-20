import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, Phone, Globe, FileText, Save, Camera, Image as ImageIcon, Sparkles, Target, Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

export default function CompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const company = user as Company;

  const [formData, setFormData] = useState({
    companyName: company?.companyName || "",
    email: company?.email || "",
    phone: company?.phone || "",
    website: company?.website || "",
    description: company?.description || "",
    industry: company?.industry || "",
    size: company?.size || "",
    about: company?.about || "",
    mission: company?.mission || "",
    culture: company?.culture || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const response = await apiRequest("PATCH", "/api/companies/profile", data);
      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Perfil atualizado!",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
      });
    },
  });

  const handleLogoUpload = async (result: UploadResult<any, any>) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const logoURL = uploadedFile.uploadURL;

        const response = await apiRequest("PUT", "/api/companies/logo", {
          logoURL,
        });

        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          toast({
            title: "Logo atualizado!",
            description: "O logo da empresa foi atualizado com sucesso.",
          });
        }
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar o logo. Tente novamente.",
      });
    }
  };

  const handleBannerUpload = async (result: UploadResult<any, any>) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const bannerURL = uploadedFile.uploadURL;

        const response = await apiRequest("PUT", "/api/companies/banner", {
          bannerURL: bannerURL,
        });

        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          toast({
            title: "Banner atualizado!",
            description: "O banner da empresa foi atualizado com sucesso.",
          });
        }
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar o banner. Tente novamente.",
      });
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      companyName: company?.companyName || "",
      email: company?.email || "",
      phone: company?.phone || "",
      website: company?.website || "",
      description: company?.description || "",
      industry: company?.industry || "",
      size: company?.size || "",
      about: company?.about || "",
      mission: company?.mission || "",
      culture: company?.culture || "",
    });
    setIsEditing(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          <div className="flex justify-end">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-edit">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </div>

      {/* Página de Apresentação */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Página de Apresentação
          </CardTitle>
          <CardDescription>
            Crie uma página atrativa para candidatos conhecerem sua empresa antes de se candidatar às vagas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Banner de Apresentação
            </Label>
            {company?.bannerUrl && (
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={company.bannerUrl} 
                  alt="Banner da empresa"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5242880}
              onGetUploadParameters={async () => {
                const response = await apiRequest("POST", "/api/objects/upload");
                const data = await response.json();
                return {
                  method: "PUT",
                  url: data.uploadURL,
                  headers: {},
                };
              }}
              onComplete={handleBannerUpload}
              buttonClassName="gap-2"
              data-testid="uploader-company-banner"
            >
              <Camera className="h-4 w-4" />
              {company?.bannerUrl ? "Trocar Banner" : "Adicionar Banner"}
            </ObjectUploader>
            <p className="text-xs text-muted-foreground">
              Imagem de capa que aparecerá no topo da sua página. Recomendado: 1200x400px
            </p>
          </div>

          <Separator />

          {/* Sobre a Empresa */}
          <div className="space-y-3">
            <Label htmlFor="about" className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-5 w-5 text-primary" />
              Sobre a Empresa
            </Label>
            <Textarea
              id="about"
              value={isEditing ? formData.about : (company?.about || "")}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              disabled={!isEditing}
              placeholder="Conte a história da sua empresa, o que vocês fazem, presença no mercado, principais conquistas..."
              rows={8}
              className="text-base"
              data-testid="textarea-about"
            />
            <p className="text-xs text-muted-foreground">
              Apresente sua empresa para os candidatos. Fale sobre o que vocês fazem, área de atuação e diferenciais.
            </p>
          </div>

          <Separator />

          {/* Missão */}
          <div className="space-y-3">
            <Label htmlFor="mission" className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Nossa Missão
            </Label>
            <Textarea
              id="mission"
              value={isEditing ? formData.mission : (company?.mission || "")}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              disabled={!isEditing}
              placeholder="Descreva a missão e objetivos da empresa..."
              rows={5}
              className="text-base"
              data-testid="textarea-mission"
            />
            <p className="text-xs text-muted-foreground">
              Qual é o propósito da sua empresa? O que vocês buscam alcançar?
            </p>
          </div>

          <Separator />

          {/* Cultura e Valores */}
          <div className="space-y-3">
            <Label htmlFor="culture" className="flex items-center gap-2 text-base font-semibold">
              <Heart className="h-5 w-5 text-primary" />
              Cultura e Valores
            </Label>
            <Textarea
              id="culture"
              value={isEditing ? formData.culture : (company?.culture || "")}
              onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
              disabled={!isEditing}
              placeholder="Descreva a cultura organizacional, valores, benefícios, ambiente de trabalho, oportunidades de crescimento..."
              rows={8}
              className="text-base"
              data-testid="textarea-culture"
            />
            <p className="text-xs text-muted-foreground">
              O que torna sua empresa um ótimo lugar para trabalhar? Quais benefícios e oportunidades vocês oferecem?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
          <CardDescription>
            Dados cadastrais e informações de contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={company?.logoUrl || undefined} 
                alt={company?.companyName}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-primary/10">
                <Building2 className="h-16 w-16 text-primary" />
              </AvatarFallback>
            </Avatar>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5242880}
              onGetUploadParameters={async () => {
                const response = await apiRequest("POST", "/api/objects/upload");
                const data = await response.json();
                return {
                  method: "PUT",
                  url: data.uploadURL,
                  headers: {},
                };
              }}
              onComplete={handleLogoUpload}
              buttonClassName="gap-2"
              data-testid="uploader-company-logo"
            >
              <Camera className="h-4 w-4" />
              {company?.logoUrl ? "Trocar Logo" : "Adicionar Logo"}
            </ObjectUploader>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={isEditing ? formData.companyName : (company?.companyName || "")}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                disabled={!isEditing}
                data-testid="input-company-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={company?.cnpj || ""}
                disabled
                data-testid="input-cnpj"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email : (company?.email || "")}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={isEditing ? formData.phone : (company?.phone || "")}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                value={isEditing ? formData.website : (company?.website || "")}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
                placeholder="https://www.suaempresa.com"
                data-testid="input-website"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sobre a Empresa (Descrição Curta) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
          <CardDescription>
            Detalhes sobre setor e tamanho da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Resumida</Label>
            <Textarea
              id="description"
              value={isEditing ? formData.description : (company?.description || "")}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              placeholder="Breve descrição da empresa (aparece em listagens)..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Indústria/Setor</Label>
              <Input
                id="industry"
                value={isEditing ? formData.industry : (company?.industry || "")}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: Mineração, Construção..."
                data-testid="input-industry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho da Empresa</Label>
              <Input
                id="size"
                value={isEditing ? formData.size : (company?.size || "")}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: 50-100 funcionários"
                data-testid="input-size"
              />
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}
