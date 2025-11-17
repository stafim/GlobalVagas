import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Briefcase, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { user, userType, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const isAdminRoute = location.startsWith('/admin') && location !== '/admin/login';

  useEffect(() => {
    if (isLoading) return;
    
    if (isAdminRoute) {
      if (!userType || userType !== 'admin') {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Faça login novamente para acessar o painel admin",
        });
        setLocation('/admin/login');
      }
    }
  }, [userType, isLoading, setLocation, isAdminRoute, toast]);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logout realizado",
        description: "Você saiu do painel administrativo",
      });
      setLocation('/admin/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Tente novamente",
      });
    }
  };

  const getPageInfo = () => {
    if (location === '/admin' || location === '/admin/') {
      return { title: "Dashboard", description: user ? (user as any).email : "" };
    }
    if (location === '/admin/clientes') {
      return { title: "Meus Clientes", description: "Gerenciamento de empresas cadastradas" };
    }
    if (location === '/admin/operadores') {
      return { title: "Meus Operadores", description: "Gerenciamento de profissionais cadastrados" };
    }
    if (location === '/admin/planos') {
      return { title: "Planos de Assinatura", description: "Gerencie os planos disponíveis para clientes" };
    }
    return { title: "Dashboard", description: "" };
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!isAdminRoute) {
    return <>{children}</>;
  }

  const pageInfo = getPageInfo();

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <img 
                src={operlistLogo} 
                alt="Operlist" 
                className="h-10 cursor-pointer" 
                onClick={() => setLocation('/')}
                data-testid="logo-home-admin"
              />
              <div className="hidden md:flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/vagas')}
                  data-testid="button-nav-jobs-admin"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Vagas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/eventos')}
                  data-testid="button-nav-events-admin"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Feiras e Eventos
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
                {pageInfo.description && (
                  <p className="text-xs text-muted-foreground">{pageInfo.description}</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
