import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
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

  const { data: companies } = useQuery<Company[]>({
    queryKey: ['/api/featured-companies', featuredCompanyIds],
    queryFn: async () => {
      const params = new URLSearchParams({
        featuredCompanyIds: JSON.stringify(featuredCompanyIds)
      });
      const response = await fetch(`/api/featured-companies?${params}`);
      if (!response.ok) throw new Error('Failed to fetch featured companies');
      return response.json();
    },
    enabled: featuredCompanyIds.length > 0,
  });

  const hasCompanies = featuredCompanyIds.length > 0 && companies && companies.length > 0;

  return (
    <section className="py-16 bg-background" data-testid="section-featured-companies">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Empresas em Destaque</h2>
          <p className="text-muted-foreground text-lg">
            Conheça as empresas que estão transformando o mercado
          </p>
        </div>

        {hasCompanies ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {companies!.map((company) => (
            <Link key={company.id} href={`/empresa/${company.id}`}>
              <Card className="hover-elevate h-full" data-testid={`card-featured-company-${company.id}`}>
                <CardContent className="p-8 flex items-center justify-center min-h-[200px]">
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt={company.companyName}
                      className="max-w-full max-h-[160px] w-auto h-auto object-contain border border-border rounded-md p-4"
                    />
                  ) : (
                    <Building2 className="h-24 w-24 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              Nenhuma empresa em destaque no momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
