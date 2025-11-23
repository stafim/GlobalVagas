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

// Map country names to ISO 3166-1 alpha-2 codes
const countryToCode: Record<string, string> = {
  "Brazil": "br",
  "United States": "us",
  "Portugal": "pt",
  "Spain": "es",
  "Argentina": "ar",
  "Chile": "cl",
  "Mexico": "mx",
  "Colombia": "co",
  "Peru": "pe",
  "Venezuela": "ve",
  "Uruguay": "uy",
  "Paraguay": "py",
  "Ecuador": "ec",
  "Bolivia": "bo",
  "France": "fr",
  "Germany": "de",
  "Italy": "it",
  "United Kingdom": "gb",
  "Canada": "ca",
  "Australia": "au",
  "Japan": "jp",
  "China": "cn",
  "India": "in",
  "Russia": "ru",
  "South Africa": "za",
  "Nigeria": "ng",
  "Kenya": "ke",
  "Egypt": "eg",
  "Morocco": "ma",
  "Angola": "ao",
  "Mozambique": "mz",
};

function getCountryCode(country: string | null): string {
  if (!country) return "un"; // Unknown flag
  return countryToCode[country] || "un";
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
                      <img
                        src={`https://flagcdn.com/w40/${countryCode}.png`}
                        srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
                        width="40"
                        height="30"
                        alt={visit.country || "Unknown"}
                        className="rounded border border-border"
                        onError={(e) => {
                          // Fallback to globe icon if flag fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center w-10 h-8 bg-muted rounded border border-border"><svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>';
                          }
                        }}
                        data-testid={`flag-${visit.id}`}
                      />
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
                            {visit.country}
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
