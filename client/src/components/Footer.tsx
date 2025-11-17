import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  const quickLinks = [
    "Buscar Vagas",
    "Publicar Vaga",
    "Empresas",
    "Sobre Nós",
    "Contato",
  ];

  const topCountries = [
    "Brasil",
    "Estados Unidos",
    "Portugal",
    "Espanha",
    "Alemanha",
    "Reino Unido",
    "Canadá",
    "Austrália",
  ];

  const topCategories = [
    "Tecnologia",
    "Saúde",
    "Finanças",
    "Educação",
    "Marketing",
    "Design",
  ];

  return (
    <footer className="bg-card border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={operlistLogo} alt="Operlist" className="h-14" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Conectando talentos a oportunidades em todo o mundo desde 2024.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
                data-testid="input-newsletter"
              />
              <Button type="submit" size="sm" data-testid="button-subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link}`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Vagas por País</h3>
            <ul className="space-y-2">
              {topCountries.map((country, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-country-${country}`}
                  >
                    {country}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Vagas por Categoria</h3>
            <ul className="space-y-2">
              {topCategories.map((category, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-category-${category}`}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Operlist. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
