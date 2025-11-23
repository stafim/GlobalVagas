import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users,
  Briefcase,
  ArrowLeft,
  Phone,
  Mail
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Company } from "@shared/schema";

interface CompanyTopic {
  id: string;
  companyId: string;
  title: string;
  content: string;
  order: string;
}

interface CompanyWithTopics extends Omit<Company, 'password'> {
  topics: CompanyTopic[];
}

export default function CompanyPublicView() {
  const [, params] = useRoute("/empresa/:id");

  const { data: company, isLoading } = useQuery<CompanyWithTopics>({
    queryKey: ['/api/public/companies', params?.id],
    enabled: !!params?.id,
  });

  const getSizeLabel = (size: string | null) => {
    const labels: Record<string, string> = {
      '1-10': '1-10 funcionários',
      '11-50': '11-50 funcionários',
      '51-200': '51-200 funcionários',
      '201-500': '201-500 funcionários',
      '501-1000': '501-1000 funcionários',
      '1001+': '1000+ funcionários',
    };
    return size ? labels[size] || size : 'Não informado';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando informações da empresa...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Empresa não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A empresa que você está procurando não existe ou foi removida.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 bg-gradient-to-r from-primary/10 to-primary/5">
          {company.bannerUrl && (
            <img 
              src={company.bannerUrl} 
              alt={company.companyName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          {/* Company Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg flex-shrink-0">
                  <AvatarImage src={company.logoUrl || undefined} alt={company.companyName} />
                  <AvatarFallback className="text-2xl">
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-company-name">
                    {company.companyName}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.industry && (
                      <Badge variant="secondary" data-testid="badge-industry">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {company.industry}
                      </Badge>
                    )}
                    {company.size && (
                      <Badge variant="outline" data-testid="badge-size">
                        <Users className="mr-1 h-3 w-3" />
                        {getSizeLabel(company.size)}
                      </Badge>
                    )}
                  </div>

                  {company.description && (
                    <p className="text-muted-foreground mb-4">
                      {company.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {company.website && (
                      <a 
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        data-testid="link-website"
                      >
                        <Globe className="h-4 w-4" />
                        {company.website}
                      </a>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1" data-testid="text-phone">
                        <Phone className="h-4 w-4" />
                        {company.phone}
                      </div>
                    )}
                    {company.email && (
                      <a 
                        href={`mailto:${company.email}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        data-testid="link-email"
                      >
                        <Mail className="h-4 w-4" />
                        {company.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <div className="grid grid-cols-1 gap-6">
            {/* About Section */}
            {company.about && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre a Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{company.about}</p>
                </CardContent>
              </Card>
            )}

            {/* Mission and Culture */}
            {(company.mission || company.culture) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Missão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{company.mission}</p>
                    </CardContent>
                  </Card>
                )}
                
                {company.culture && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cultura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{company.culture}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Custom Topics */}
            {company.topics && company.topics.length > 0 && (
              <>
                {company.topics.map((topic) => (
                  <Card key={topic.id}>
                    <CardHeader>
                      <CardTitle>{topic.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{topic.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
