import { Globe, User, LogOut, Settings, LayoutDashboard, Briefcase, BookmarkIcon, FileText, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import operlistLogo from "@assets/operlist2025_1763133653351.png";
import type { Operator, Company } from "@shared/schema";

interface HeaderProps {
  onLanguageToggle?: () => void;
  language?: string;
}

export function Header({ onLanguageToggle, language = "PT" }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user, userType, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    setLocation("/login");
  };

  const handlePostJobClick = () => {
    setLocation("/login");
  };

  const handleLogoClick = () => {
    setLocation("/");
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    if (userType === 'operator') {
      setLocation("/perfil/operador");
    } else if (userType === 'company') {
      setLocation("/dashboard/empresa");
    }
  };

  const getFirstName = () => {
    if (!user) return "";
    if (userType === 'operator') {
      const operatorUser = user as Operator;
      return operatorUser.fullName?.split(' ')[0] || "";
    } else if (userType === 'company') {
      const companyUser = user as Company;
      return companyUser.companyName?.split(' ')[0] || "";
    }
    return "";
  };

  return (
    <header className="sticky top-0 z-[100] bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-2">
            <img 
              src={operlistLogo} 
              alt="Operlist" 
              className="h-14 cursor-pointer" 
              onClick={handleLogoClick}
              data-testid="logo-home"
            />
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/vagas')}
              data-testid="button-nav-jobs"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Vagas
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation('/eventos')}
              data-testid="button-nav-events"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Feiras e Eventos
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLanguageToggle}
              data-testid="button-language-toggle"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="hidden sm:flex gap-2"
                    data-testid="button-user-menu"
                  >
                    <User className="h-4 w-4" />
                    {getFirstName()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {userType === 'operator' ? (
                    <>
                      <DropdownMenuItem onClick={() => setLocation('/dashboard/operador')} data-testid="menu-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/perfil/operador')} data-testid="menu-profile">
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled data-testid="menu-applications">
                        <FileText className="mr-2 h-4 w-4" />
                        Minhas Candidaturas
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled data-testid="menu-saved">
                        <BookmarkIcon className="mr-2 h-4 w-4" />
                        Vagas Salvas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled data-testid="menu-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setLocation('/dashboard/empresa')} data-testid="menu-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled data-testid="menu-jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Minhas Vagas
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled data-testid="menu-candidates">
                        <User className="mr-2 h-4 w-4" />
                        Candidatos
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled data-testid="menu-company-profile">
                        <Building2 className="mr-2 h-4 w-4" />
                        Perfil da Empresa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled data-testid="menu-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="hidden sm:flex" 
                onClick={handleLoginClick}
                data-testid="button-login"
              >
                Entrar
              </Button>
            )}
            
            {(!isAuthenticated || userType === 'company') && (
              <Button 
                variant="default" 
                className="hidden sm:flex" 
                onClick={handlePostJobClick}
                data-testid="button-post-job"
              >
                Publicar Vaga
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
