import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, Phone, Globe, FileText, Save, Camera } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";

export default function CompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const company = user as Company;

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

  const handleSave = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de edição de perfil estará disponível em breve",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
              Cancelar
            </Button>
            <Button onClick={handleSave} data-testid="button-save-profile">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </div>

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
              data-testid="uploader-company-logo"
            >
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                data-testid="button-upload-logo"
              >
                <Camera className="h-4 w-4" />
                {company?.logoUrl ? "Trocar Logo" : "Adicionar Logo"}
              </Button>
            </ObjectUploader>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={company?.companyName || ""}
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
                value={company?.email || ""}
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
                value={company?.phone || ""}
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
                value={company?.website || ""}
                disabled={!isEditing}
                placeholder="https://www.suaempresa.com"
                data-testid="input-website"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sobre a Empresa
          </CardTitle>
          <CardDescription>
            Descrição e informações adicionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={company?.description || ""}
              disabled={!isEditing}
              placeholder="Descreva sua empresa, área de atuação e valores..."
              rows={6}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Indústria/Setor</Label>
              <Input
                id="industry"
                value={company?.industry || ""}
                disabled={!isEditing}
                placeholder="Ex: Mineração, Construção..."
                data-testid="input-industry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho da Empresa</Label>
              <Input
                id="size"
                value={company?.size || ""}
                disabled={!isEditing}
                placeholder="Ex: 50-100 funcionários"
                data-testid="input-size"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
