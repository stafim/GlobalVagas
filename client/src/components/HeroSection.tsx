import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Mining_heavy_equipment_scene_02b6e20e.png";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const heroTitle = settingsData?.hero_title || "Encontre Seu Emprego dos Sonhos em Qualquer Lugar do Mundo";
  const heroSubtitle = settingsData?.hero_subtitle || "Mais de 50.000 vagas em 150+ países";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to jobs page with search query
    if (searchQuery.trim()) {
      setLocation(`/vagas?busca=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/vagas');
    }
  };

  return (
    <section className="relative h-[60vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4" data-testid="text-hero-title">
          {heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8" data-testid="text-hero-subtitle">
          {heroSubtitle}
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2 backdrop-blur-md bg-white/10 p-2 rounded-lg border border-white/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="search"
                placeholder="Cargo, palavra-chave ou empresa"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white text-foreground border-0"
                data-testid="input-hero-search"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-8"
              data-testid="button-hero-search"
            >
              Buscar
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
