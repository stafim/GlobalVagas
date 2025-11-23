import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Settings as SettingsIcon, Save, AlertCircle, Type, BarChart3, Send, Building2 } from "lucide-react";
import type { Company } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmailSettings } from "@shared/schema";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const { userType } = useAuth();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState("gmail");
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

  const [aboutWhoWeAre, setAboutWhoWeAre] = useState("");
  const [aboutMission, setAboutMission] = useState("");
  const [aboutValues, setAboutValues] = useState("");

  const [featuredCompanyIds, setFeaturedCompanyIds] = useState<string[]>([]);

  const { data: emailSettings, isLoading: emailLoading } = useQuery<EmailSettings>({
    queryKey: ['/api/email-settings'],
    retry: false,
    enabled: userType === 'admin',
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const { data: allCompanies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    retry: false,
    enabled: userType === 'admin',
  });

  useEffect(() => {
    if (emailSettings) {
      setProvider(emailSettings.provider || "gmail");
      setApiKey(emailSettings.apiKey || "");
      setSenderEmail(emailSettings.senderEmail || "");
      setSenderName(emailSettings.senderName || "");
      setSmtpHost(emailSettings.smtpHost || "smtp.gmail.com");
      setSmtpPort(emailSettings.smtpPort || "587");
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
      setAboutWhoWeAre(settingsData.about_who_we_are || "");
      setAboutMission(settingsData.about_mission || "");
      setAboutValues(settingsData.about_values || "");
      
      if (settingsData.featured_companies) {
        try {
          setFeaturedCompanyIds(JSON.parse(settingsData.featured_companies));
        } catch (e) {
          setFeaturedCompanyIds([]);
        }
      } else {
        setFeaturedCompanyIds([]);
      }
    }
  }, [settingsData]);

  const saveEmailSettingsMutation = useMutation({
    mutationFn: async () => {
      const data = {
        provider,
        apiKey: null,
        senderEmail,
        senderName,
        smtpHost: provider === 'gmail' ? 'smtp.gmail.com' : smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
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

  const sendTestEmailMutation = useMutation({
    mutationFn: async (recipientEmail: string) => {
      return await apiRequest('POST', '/api/email-settings/test', { recipientEmail });
    },
    onSuccess: (_, recipientEmail) => {
      toast({
        title: "Email enviado!",
        description: `Email de teste enviado com sucesso para ${recipientEmail}.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error?.message || "Verifique as configurações SMTP e tente novamente.",
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

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todas as configurações SMTP.",
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

  const saveAboutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings', {
        key: 'about_who_we_are',
        value: aboutWhoWeAre,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'about_mission',
        value: aboutMission,
      });
      await apiRequest('POST', '/api/settings', {
        key: 'about_values',
        value: aboutValues,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Informações atualizadas!",
        description: "As informações 'Quem Somos' foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações. Tente novamente.",
      });
    },
  });

  const handleSaveAbout = () => {
    saveAboutMutation.mutate();
  };

  const saveFeaturedCompaniesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings', {
        key: 'featured_companies',
        value: JSON.stringify(featuredCompanyIds),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Empresas em destaque atualizadas!",
        description: "As empresas em destaque foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as empresas em destaque. Tente novamente.",
      });
    },
  });

  const handleSaveFeaturedCompanies = () => {
    saveFeaturedCompaniesMutation.mutate();
  };

  const toggleFeaturedCompany = (companyId: string) => {
    setFeaturedCompanyIds(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const isLoading = emailLoading || settingsLoading || companiesLoading;

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

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Quem Somos
            </CardTitle>
            <CardDescription>
              Configure os textos da seção "Quem Somos" da página inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutWhoWeAre">Quem Somos</Label>
                <Textarea
                  id="aboutWhoWeAre"
                  placeholder="Escreva sobre a empresa, sua história e propósito..."
                  value={aboutWhoWeAre}
                  onChange={(e) => setAboutWhoWeAre(e.target.value)}
                  rows={4}
                  data-testid="textarea-who-we-are"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMission">Missão</Label>
                <Textarea
                  id="aboutMission"
                  placeholder="Descreva a missão da empresa..."
                  value={aboutMission}
                  onChange={(e) => setAboutMission(e.target.value)}
                  rows={3}
                  data-testid="textarea-mission"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutValues">Valores</Label>
                <Textarea
                  id="aboutValues"
                  placeholder="Liste os valores da empresa..."
                  value={aboutValues}
                  onChange={(e) => setAboutValues(e.target.value)}
                  rows={3}
                  data-testid="textarea-values"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveAbout}
                disabled={saveAboutMutation.isPending}
                data-testid="button-save-about"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveAboutMutation.isPending ? 'Salvando...' : 'Salvar Informações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas em Destaque
            </CardTitle>
            <CardDescription>
              Selecione as empresas que aparecerão na seção "Empresas em Destaque" da página inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {allCompanies && allCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-start gap-3 p-3 rounded-md border hover-elevate"
                      data-testid={`company-selector-${company.id}`}
                    >
                      <Checkbox
                        id={`company-${company.id}`}
                        checked={featuredCompanyIds.includes(company.id)}
                        onCheckedChange={() => toggleFeaturedCompany(company.id)}
                        data-testid={`checkbox-company-${company.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`company-${company.id}`}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          {company.logoUrl && (
                            <img 
                              src={company.logoUrl} 
                              alt={company.companyName}
                              className="w-6 h-6 rounded object-cover"
                            />
                          )}
                          <span className="truncate">{company.companyName}</span>
                        </label>
                        {company.industry && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma empresa cadastrada no sistema
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {featuredCompanyIds.length} {featuredCompanyIds.length === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
              </p>
              <Button 
                onClick={handleSaveFeaturedCompanies}
                disabled={saveFeaturedCompaniesMutation.isPending}
                data-testid="button-save-featured-companies"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveFeaturedCompaniesMutation.isPending ? 'Salvando...' : 'Salvar Seleção'}
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
                <p className="font-medium mb-1">Configuração de SMTP Gmail</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Para usar Gmail SMTP, você precisa criar uma "Senha de App" nas configurações de segurança da sua conta Google. 
                  Não use sua senha normal do Gmail.
                </p>
                <ul className="list-disc list-inside mt-2 text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Host: smtp.gmail.com</li>
                  <li>Porta: 587 (TLS) ou 465 (SSL)</li>
                  <li>Usuário: seu email completo do Gmail</li>
                  <li>Senha: Senha de App (16 caracteres)</li>
                </ul>
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
                    <SelectItem value="gmail">Gmail SMTP</SelectItem>
                    <SelectItem value="smtp">Outro SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>


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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Host SMTP</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    data-testid="input-smtp-host"
                    disabled={provider === 'gmail'}
                  />
                  {provider === 'gmail' && (
                    <p className="text-xs text-muted-foreground">Gmail usa smtp.gmail.com automaticamente</p>
                  )}
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
                  <p className="text-xs text-muted-foreground">Use 587 (TLS) ou 465 (SSL)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuário SMTP (Email Gmail)</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    placeholder="seuemail@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    data-testid="input-smtp-user"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Senha de App Gmail</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    placeholder="Senha de 16 caracteres"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    data-testid="input-smtp-password"
                  />
                  <p className="text-xs text-muted-foreground">Não use sua senha normal do Gmail</p>
                </div>
              </div>

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

            <div className="flex justify-between items-center pt-4 border-t gap-3">
              <Button 
                variant="outline"
                onClick={() => sendTestEmailMutation.mutate('stafim2@gmail.com')}
                disabled={sendTestEmailMutation.isPending || !emailSettings}
                data-testid="button-test-email"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendTestEmailMutation.isPending ? 'Enviando...' : 'Testar Email'}
              </Button>
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
