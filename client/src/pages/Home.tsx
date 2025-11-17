import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobCard, type JobCardProps } from "@/components/JobCard";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import techLogo from "@assets/generated_images/Tech_company_logo_placeholder_52258a35.png";
import healthLogo from "@assets/generated_images/Healthcare_company_logo_placeholder_59b2d215.png";
import financeLogo from "@assets/generated_images/Finance_company_logo_placeholder_e438b06d.png";
import retailLogo from "@assets/generated_images/Retail_company_logo_placeholder_6fad54c7.png";

export default function Home() {
  const [language, setLanguage] = useState("PT");

  const handleLanguageToggle = () => {
    setLanguage(language === "PT" ? "EN" : "PT");
    console.log("Language switched to:", language === "PT" ? "EN" : "PT");
  };

  const mockJobs: JobCardProps[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc",
      companyLogo: techLogo,
      location: "São Paulo",
      country: "Brasil",
      workType: "Remote",
      contractType: "Full-time",
      salary: "$80k - $120k",
      description: "Buscamos desenvolvedor frontend experiente para trabalhar com React, TypeScript e tecnologias modernas em projetos inovadores.",
      postedTime: "2 dias atrás",
      applicants: 45,
      verified: true,
    },
    {
      id: "2",
      title: "UX/UI Designer",
      company: "HealthTech Solutions",
      companyLogo: healthLogo,
      location: "Lisboa",
      country: "Portugal",
      workType: "Hybrid",
      contractType: "Full-time",
      salary: "€50k - €70k",
      description: "Designer criativo para criar experiências intuitivas em plataforma de saúde digital. Experiência com Figma e design systems.",
      postedTime: "5 dias atrás",
      applicants: 28,
      verified: true,
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "FinanceAI Corp",
      companyLogo: financeLogo,
      location: "Nova York",
      country: "Estados Unidos",
      workType: "Onsite",
      contractType: "Full-time",
      salary: "$120k - $160k",
      description: "Cientista de dados para desenvolver modelos de ML em análise de risco financeiro. Python, TensorFlow, experiência em finanças.",
      postedTime: "1 semana atrás",
      applicants: 67,
      verified: true,
    },
    {
      id: "4",
      title: "Product Manager",
      company: "RetailGlobal",
      companyLogo: retailLogo,
      location: "Londres",
      country: "Reino Unido",
      workType: "Hybrid",
      contractType: "Full-time",
      salary: "£65k - £85k",
      description: "PM para liderar desenvolvimento de plataforma e-commerce. Experiência em agile, roadmap e stakeholder management.",
      postedTime: "3 dias atrás",
      applicants: 52,
      verified: false,
    },
    {
      id: "5",
      title: "DevOps Engineer",
      company: "TechCorp Inc",
      companyLogo: techLogo,
      location: "Berlim",
      country: "Alemanha",
      workType: "Remote",
      contractType: "Contract",
      salary: "€70k - $95k",
      description: "Engenheiro DevOps para gerenciar infraestrutura cloud (AWS/Azure), CI/CD pipelines e automação de deployments.",
      postedTime: "4 dias atrás",
      applicants: 31,
      verified: true,
    },
    {
      id: "6",
      title: "Marketing Manager",
      company: "HealthTech Solutions",
      companyLogo: healthLogo,
      location: "Toronto",
      country: "Canadá",
      workType: "Hybrid",
      contractType: "Full-time",
      salary: "C$75k - C$95k",
      description: "Gerente de marketing para liderar estratégias digitais e growth. Experiência com SEO, SEM, marketing de conteúdo.",
      postedTime: "1 dia atrás",
      applicants: 19,
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLanguageToggle={handleLanguageToggle} language={language} />
      <HeroSection />
      <StatsSection />
      
      <main className="flex-1">
        <CategorySection />
        
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="font-heading font-bold text-2xl mb-6">
              Vagas Recentes
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="hidden md:block">
                <FilterSidebar />
              </div>
              
              <div className="flex-1">
                <div className="space-y-4">
                  {mockJobs.map((job) => (
                    <JobCard key={job.id} {...job} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
