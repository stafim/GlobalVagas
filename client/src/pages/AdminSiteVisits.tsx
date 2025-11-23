import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, MapPin, Monitor, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/AdminShell";

interface SiteVisit {
  id: string;
  ipAddress: string;
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent: string | null;
  visitedAt: string;
}

// Map country ISO codes to friendly names (most common ones)
const countryNames: Record<string, string> = {
  "BR": "Brasil",
  "US": "Estados Unidos",
  "PT": "Portugal",
  "ES": "Espanha",
  "AR": "Argentina",
  "CL": "Chile",
  "MX": "México",
  "CO": "Colômbia",
  "PE": "Peru",
  "VE": "Venezuela",
  "UY": "Uruguai",
  "PY": "Paraguai",
  "EC": "Equador",
  "BO": "Bolívia",
  "FR": "França",
  "DE": "Alemanha",
  "IT": "Itália",
  "GB": "Reino Unido",
  "CA": "Canadá",
  "AU": "Austrália",
  "JP": "Japão",
  "CN": "China",
  "IN": "Índia",
  "RU": "Rússia",
  "ZA": "África do Sul",
  "NG": "Nigéria",
  "KE": "Quênia",
  "EG": "Egito",
  "MA": "Marrocos",
  "AO": "Angola",
  "MZ": "Moçambique",
};

function getCountryName(countryCode: string | null): string {
  if (!countryCode) return "Desconhecido";
  return countryNames[countryCode.toUpperCase()] || countryCode;
}

function getCountryCode(country: string | null): string {
  if (!country) return "un"; // Unknown flag
  // Country is already an ISO code from geoip-lite
  return country.toLowerCase();
}

function AdminSiteVisitsContent() {
  const { data: visits, isLoading } = useQuery<SiteVisit[]>({
    queryKey: ['/api/admin/site-visits'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link href="/admin/ao-vivo">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao AO VIVO
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              Visitas ao Site - Detalhado
            </CardTitle>
            <CardDescription>Todas as visitas registradas na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/ao-vivo">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao AO VIVO
          </Button>
        </Link>
      </div>

      <Card data-testid="card-site-visits">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Visitas ao Site - Detalhado
          </CardTitle>
          <CardDescription>
            Total de {visits?.length || 0} visitas registradas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visits && visits.length > 0 ? (
              visits.map((visit) => {
                const countryCode = getCountryCode(visit.country);
                
                return (
                  <div
                    key={visit.id}
                    className="flex items-center gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`visit-${visit.id}`}
                  >
                    {/* Country Flag */}
                    <div className="flex-shrink-0">
                      {visit.country ? (
                        <img
                          src={`https://flagcdn.com/w40/${countryCode}.png`}
                          srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
                          width="40"
                          height="30"
                          alt={getCountryName(visit.country)}
                          className="rounded border border-border"
                          data-testid={`flag-${visit.id}`}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-8 bg-muted rounded border border-border">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Visit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          {visit.ipAddress}
                        </Badge>
                        {visit.country && (
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {getCountryName(visit.country)}
                            {visit.city && `, ${visit.city}`}
                            {visit.region && visit.region !== visit.city && ` - ${visit.region}`}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium" data-testid={`text-date-${visit.id}`}>
                          {format(new Date(visit.visitedAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                        </span>
                        {visit.userAgent && (
                          <span className="flex items-center gap-1 truncate">
                            <Monitor className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{visit.userAgent}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma visita registrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSiteVisits() {
  return (
    <AdminShell>
      <AdminSiteVisitsContent />
    </AdminShell>
  );
}
