import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Save, AlertCircle, CheckCircle2, Sparkles, Settings as SettingsIcon, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AISettings {
  ai_enabled: string;
  ai_model: string;
  ai_temperature: string;
  ai_max_tokens: string;
  ai_system_prompt: string;
  ai_api_key?: string;
}

export default function AdminAI() {
  const { userType } = useAuth();
  const { toast } = useToast();
  
  const [enabled, setEnabled] = useState(false);
  const [model, setModel] = useState("grok-4");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("1000");
  const [systemPrompt, setSystemPrompt] = useState("Você é um assistente útil da plataforma Operlist.");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: aiSettings, isLoading: settingsLoading } = useQuery<AISettings>({
    queryKey: ['/api/admin/ai-settings'],
    retry: false,
    enabled: userType === 'admin',
  });

  useEffect(() => {
    if (aiSettings) {
      setEnabled(aiSettings.ai_enabled === 'true');
      setModel(aiSettings.ai_model || 'grok-4');
      setTemperature(aiSettings.ai_temperature || '0.7');
      setMaxTokens(aiSettings.ai_max_tokens || '1000');
      setSystemPrompt(aiSettings.ai_system_prompt || 'Você é um assistente útil da plataforma Operlist.');
      setApiKey(aiSettings.ai_api_key || '');
    }
  }, [aiSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const data: Record<string, string> = {
        ai_enabled: enabled ? 'true' : 'false',
        ai_model: model,
        ai_temperature: temperature,
        ai_max_tokens: maxTokens,
        ai_system_prompt: systemPrompt,
      };
      
      // Only include API key if it's been set
      if (apiKey) {
        data.ai_api_key = apiKey;
      }
      
      return await apiRequest('POST', '/api/admin/ai-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-settings'] });
      toast({
        title: "Configurações salvas!",
        description: "As configurações de IA foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar configurações de IA",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey) {
        throw new Error("API Key é obrigatória para testar a conexão");
      }
      return await apiRequest('POST', '/api/admin/ai-settings/test', { apiKey });
    },
    onSuccess: (data: any) => {
      setTestResult({ success: true, message: data.message });
      toast({
        title: "Conexão testada!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      const message = error.message || "Erro ao testar conexão";
      setTestResult({ success: false, message });
      toast({
        title: "Erro no teste",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate();
  };

  const handleTest = () => {
    setTestResult(null);
    testConnectionMutation.mutate();
  };

  if (userType !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configurações de IA</h1>
          <p className="text-muted-foreground">
            Configure a integração com xAI Grok para recursos de inteligência artificial
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status da Integração */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Status da Integração</CardTitle>
            </div>
            <CardDescription>
              Ative ou desative os recursos de IA na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="ai-enabled" className="text-base font-medium">
                  Habilitar IA
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ative para permitir recursos de inteligência artificial na plataforma
                </p>
              </div>
              <Switch
                id="ai-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                data-testid="switch-ai-enabled"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuração da API */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <CardTitle>Configuração da API xAI</CardTitle>
            </div>
            <CardDescription>
              Configure sua chave de API do xAI (Grok)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Como obter sua API Key</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>1. Acesse <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.x.ai</a></p>
                <p>2. Faça login com sua conta X (Twitter)</p>
                <p>3. Navegue até a seção "API Keys"</p>
                <p>4. Gere uma nova chave e copie-a aqui</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key do xAI</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="xai-..."
                    data-testid="input-api-key"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                    data-testid="button-toggle-api-key"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={handleTest}
                  disabled={!apiKey || testConnectionMutation.isPending}
                  data-testid="button-test-connection"
                >
                  {testConnectionMutation.isPending ? "Testando..." : "Testar Conexão"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sua chave de API será armazenada de forma segura. Use apenas para testes. Para produção, configure via secrets.
              </p>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.success ? "Sucesso!" : "Erro"}
                </AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Configurações do Modelo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Configurações do Modelo</CardTitle>
            </div>
            <CardDescription>
              Configure o modelo e parâmetros de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" data-testid="select-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grok-4">Grok 4 (Flagship - Mais Poderoso)</SelectItem>
                  <SelectItem value="grok-3">Grok 3 (Balanceado)</SelectItem>
                  <SelectItem value="grok-3-mini">Grok 3 Mini (Rápido e Econômico)</SelectItem>
                  <SelectItem value="grok-vision-beta">Grok Vision (Imagens)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {model === 'grok-4' && "Melhor para raciocínio complexo, matemática e código. 256K contexto."}
                {model === 'grok-3' && "Equilibrado entre qualidade e custo. 128K contexto."}
                {model === 'grok-3-mini' && "Tarefas rápidas e econômicas."}
                {model === 'grok-vision-beta' && "Compreensão de imagens e texto."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura: {temperature}</Label>
              <Input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                data-testid="input-temperature"
              />
              <p className="text-xs text-muted-foreground">
                Controla a criatividade. Menor = mais focado, Maior = mais criativo (0-2)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Máximo de Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min="1"
                max="256000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                data-testid="input-max-tokens"
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de tokens na resposta (1-256000)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-prompt">Prompt do Sistema</Label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                placeholder="Você é um assistente útil da plataforma Operlist..."
                data-testid="textarea-system-prompt"
              />
              <p className="text-xs text-muted-foreground">
                Define o comportamento e contexto base da IA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending || settingsLoading}
            data-testid="button-save-settings"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
