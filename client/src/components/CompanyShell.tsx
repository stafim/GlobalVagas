import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/components/CompanySidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

interface CompanyShellProps {
  children: React.ReactNode;
}

export function CompanyShell({ children }: CompanyShellProps) {
  const { user, userType, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const isCompanyRoute = location.startsWith('/dashboard/empresa') || location.startsWith('/empresa/');

  useEffect(() => {
    if (isLoading) return;
    
    if (isCompanyRoute) {
      if (!userType || userType !== 'company') {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Faça login novamente para acessar o painel",
        });
        setLocation('/login');
      }
    }
  }, [userType, isLoading, setLocation, isCompanyRoute, toast]);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema",
      });
      setLocation('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Tente novamente",
      });
    }
  };

  const getPageInfo = () => {
    if (location === '/dashboard/empresa') {
      return { title: "Dashboard", description: user ? (user as any).companyName || (user as any).email : "" };
    }
    if (location === '/empresa/vagas') {
      return { title: "Minhas Vagas", description: "Gerencie suas vagas publicadas" };
    }
    if (location === '/empresa/plano') {
      return { title: "Meu Plano", description: "Visualize seus planos e assinaturas" };
    }
    if (location === '/empresa/perfil') {
      return { title: "Perfil da Empresa", description: "Informações e configurações da empresa" };
    }
    if (location === '/empresa/creditos') {
      return { title: "Meus Créditos", description: "" };
    }
    return { title: "Dashboard", description: "" };
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!isCompanyRoute || isLoading) {
    return <>{children}</>;
  }

  const pageInfo = getPageInfo();

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <CompanySidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-xl font-bold">{pageInfo.title}</h1>
                {pageInfo.description && (
                  <p className="text-xs text-muted-foreground">{pageInfo.description}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
              title="Sair"
              className="hover-elevate"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
