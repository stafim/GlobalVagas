import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Settings as SettingsIcon, Save, AlertCircle, Type, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmailSettings } from "@shared/schema";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const { userType } = useAuth();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState("sendgrid");
  const [apiKey, setApiKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [isActive, setIsActive] = useState("true");

  const [heroTitle, setHeroTitle] = useState("Encontre Seu Emprego dos Sonhos em Qualquer Lugar do Mundo");
  const [heroSubtitle, setHeroSubtitle] = useState("Mais de 50.000 vagas em 150+ países");

  const [statsJobs, setStatsJobs] = useState("50.000+");
  const [statsCompanies, setStatsCompanies] = useState("15.000+");
  const [statsCountries, setStatsCountries] = useState("150+");
  const [statsSalary, setStatsSalary] = useState("$75k");

  const { data: emailSettings, isLoading: emailLoading } = useQuery<EmailSettings>({
    queryKey: ['/api/email-settings'],
    retry: false,
    enabled: userType === 'admin',
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  useEffect(() => {
    if (emailSettings) {
      setProvider(emailSettings.provider || "sendgrid");
      setApiKey(emailSettings.apiKey || "");
      setSenderEmail(emailSettings.senderEmail || "");
      setSenderName(emailSettings.senderName || "");
      setSmtpHost(emailSettings.smtpHost || "");
      setSmtpPort(emailSettings.smtpPort || "");
      setSmtpUser(emailSettings.smtpUser || "");
      setSmtpPassword(emailSettings.smtpPassword || "");
      setIsActive(emailSettings.isActive || "true");
    }
  }, [emailSettings]);

  useEffect(() => {
    if (settingsData) {
      setHeroTitle(settingsData.hero_title || "Encontre Seu Emprego dos Sonhos em Qualquer Lugar do Mundo");
      setHeroSubtitle(settingsData.hero_subtitle || "Mais de 50.000 vagas em 150+ países");
      setStatsJobs(settingsData.stats_jobs_value || "50.000+");
      setStatsCompanies(settingsData.stats_companies_value || "15.000+");
      setStatsCountries(settingsData.stats_countries_value || "150+");
      setStatsSalary(settingsData.stats_salary_value || "$75k");
    }
  }, [settingsData]);

  const saveEmailSettingsMutation = useMutation({
    mutationFn: async () => {
      const data = {
        provider,
        apiKey: provider === 'smtp' ? null : apiKey,
        senderEmail,
        senderName,
        smtpHost: provider === 'smtp' ? smtpHost : null,
        smtpPort: provider === 'smtp' ? smtpPort : null,
        smtpUser: provider === 'smtp' ? smtpUser : null,
        smtpPassword: provider === 'smtp' ? smtpPassword : null,
        isActive,
      };
      return await apiRequest('POST', '/api/email-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-settings'] });
      toast({
        title: "Configurações salvas!",
        description: "As configurações de email foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
      });
    },
  });

  const saveHeroTextsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings', {
        key: 'hero_title',
        value: heroTitle,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'hero_subtitle',
        value: heroSubtitle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Textos atualizados!",
        description: "Os textos da página inicial foram atualizados com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os textos. Tente novamente.",
      });
    },
  });

  const handleSaveEmail = () => {
    if (!senderEmail || !senderName) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o email e nome do remetente.",
      });
      return;
    }

    if (provider === 'smtp' && (!smtpHost || !smtpPort)) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha as configurações SMTP.",
      });
      return;
    }

    if (provider !== 'smtp' && !apiKey) {
      toast({
        variant: "destructive",
        title: "API Key obrigatória",
        description: "Forneça a API Key para o provedor selecionado.",
      });
      return;
    }

    saveEmailSettingsMutation.mutate();
  };

  const saveStatsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings', {
        key: 'stats_jobs_value',
        value: statsJobs,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'stats_companies_value',
        value: statsCompanies,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'stats_countries_value',
        value: statsCountries,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'stats_salary_value',
        value: statsSalary,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Estatísticas atualizadas!",
        description: "As estatísticas foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as estatísticas. Tente novamente.",
      });
    },
  });

  const handleSaveHeroTexts = () => {
    if (!heroTitle || !heroSubtitle) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o título e subtítulo.",
      });
      return;
    }
    saveHeroTextsMutation.mutate();
  };

  const handleSaveStats = () => {
    if (!statsJobs || !statsCompanies || !statsCountries || !statsSalary) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos de estatísticas.",
      });
      return;
    }
    saveStatsMutation.mutate();
  };

  const isLoading = emailLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>

        {/* Hero Texts Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Textos da Página Inicial
              </CardTitle>
              <CardDescription className="mt-2">
                Personalize o título e subtítulo exibidos na seção principal da home
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Título Principal</Label>
                <Input
                  id="heroTitle"
                  placeholder="Ex: Encontre Seu Emprego dos Sonhos"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  data-testid="input-hero-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtítulo</Label>
                <Input
                  id="heroSubtitle"
                  placeholder="Ex: Mais de 50.000 vagas em 150+ países"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  data-testid="input-hero-subtitle"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveHeroTexts}
                disabled={saveHeroTextsMutation.isPending}
                data-testid="button-save-hero-texts"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveHeroTextsMutation.isPending ? 'Salvando...' : 'Salvar Textos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas da Página Inicial
              </CardTitle>
              <CardDescription className="mt-2">
                Configure os números exibidos na seção de estatísticas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="statsJobs">Vagas Ativas</Label>
                <Input
                  id="statsJobs"
                  placeholder="Ex: 50.000+"
                  value={statsJobs}
                  onChange={(e) => setStatsJobs(e.target.value)}
                  data-testid="input-stats-jobs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statsCompanies">Empresas</Label>
                <Input
                  id="statsCompanies"
                  placeholder="Ex: 15.000+"
                  value={statsCompanies}
                  onChange={(e) => setStatsCompanies(e.target.value)}
                  data-testid="input-stats-companies"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statsCountries">Países</Label>
                <Input
                  id="statsCountries"
                  placeholder="Ex: 150+"
                  value={statsCountries}
                  onChange={(e) => setStatsCountries(e.target.value)}
                  data-testid="input-stats-countries"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statsSalary">Salário Médio</Label>
                <Input
                  id="statsSalary"
                  placeholder="Ex: $75k"
                  value={statsSalary}
                  onChange={(e) => setStatsSalary(e.target.value)}
                  data-testid="input-stats-salary"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveStats}
                disabled={saveStatsMutation.isPending}
                data-testid="button-save-stats"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveStatsMutation.isPending ? 'Salvando...' : 'Salvar Estatísticas'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuração de Email
              </CardTitle>
              <CardDescription className="mt-2">
                Configure o provedor de email para envio de notificações
              </CardDescription>
            </div>
            {emailSettings && (
              <Badge variant={isActive === 'true' ? "default" : "secondary"} data-testid="badge-email-status">
                {isActive === 'true' ? 'Ativo' : 'Inativo'}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Integrações Replit Disponíveis</p>
                <p className="text-blue-700 dark:text-blue-300">
                  SendGrid, Resend, Gmail e Outlook estão disponíveis como integrações nativas do Replit com gerenciamento automático de credenciais.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor de Email</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider" data-testid="select-email-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="smtp">SMTP Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider !== 'smtp' && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Cole sua API key aqui"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    data-testid="input-api-key"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Email do Remetente</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    placeholder="noreply@operlist.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    data-testid="input-sender-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nome do Remetente</Label>
                  <Input
                    id="senderName"
                    placeholder="Operlist"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    data-testid="input-sender-name"
                  />
                </div>
              </div>

              {provider === 'smtp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">Host SMTP</Label>
                      <Input
                        id="smtpHost"
                        placeholder="smtp.gmail.com"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        data-testid="input-smtp-host"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">Porta SMTP</Label>
                      <Input
                        id="smtpPort"
                        placeholder="587"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        data-testid="input-smtp-port"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Usuário SMTP</Label>
                      <Input
                        id="smtpUser"
                        placeholder="usuario@email.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        data-testid="input-smtp-user"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Senha SMTP</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        placeholder="••••••••"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        data-testid="input-smtp-password"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={isActive} onValueChange={setIsActive}>
                  <SelectTrigger id="status" data-testid="select-email-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveEmail}
                disabled={saveEmailSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveEmailSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
