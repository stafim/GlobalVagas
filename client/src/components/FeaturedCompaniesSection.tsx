import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Users } from "lucide-react";
import { Link } from "wouter";
import type { Company } from "@shared/schema";

export function FeaturedCompaniesSection() {
  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const featuredCompanyIds = settingsData?.featured_companies 
    ? JSON.parse(settingsData.featured_companies) 
    : [];

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ['/api/featured-companies', featuredCompanyIds],
    enabled: featuredCompanyIds.length > 0,
  });

  if (!featuredCompanyIds.length || !companies?.length) {
    return null;
  }

  const getSizeLabel = (size: string | null) => {
    const labels: Record<string, string> = {
      '1-10': '1-10 funcionários',
      '11-50': '11-50 funcionários',
      '51-200': '51-200 funcionários',
      '201-500': '201-500 funcionários',
      '501-1000': '501-1000 funcionários',
      '1001+': '1000+ funcionários',
    };
    return size ? labels[size] || size : null;
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Empresas em Destaque</h2>
          <p className="text-muted-foreground text-lg">
            Conheça as empresas que estão transformando o mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link key={company.id} href={`/empresa/${company.id}`}>
              <Card className="hover-elevate h-full" data-testid={`card-featured-company-${company.id}`}>
                <CardContent className="p-6">
                  {/* Logo e Nome */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {company.logoUrl ? (
                        <img 
                          src={company.logoUrl} 
                          alt={company.companyName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate">
                        {company.companyName}
                      </h3>
                      {company.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  {company.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}

                  {/* Informações adicionais */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {company.size && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{getSizeLabel(company.size)}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
