import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

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
    if (location === '/admin/vagas') {
      return { title: "Vagas", description: "Visualize todas as vagas criadas pelos clientes" };
    }
    if (location.startsWith('/admin/vagas/') && location.endsWith('/editar')) {
      return { title: "Editar Vaga", description: "Atualize as informações da vaga" };
    }
    if (location === '/admin/planos') {
      return { title: "Planos de Assinatura", description: "Gerencie os planos disponíveis para clientes" };
    }
    if (location === '/admin/taxonomia') {
      return { title: "Taxonomia", description: "Gerencie as classificações e categorias do sistema" };
    }
    if (location === '/admin/newsletter') {
      return { title: "Newsletter", description: "Gerencie as inscrições da newsletter" };
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
              <div>
                <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
                {pageInfo.description && (
                  <p className="text-xs text-muted-foreground">{pageInfo.description}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
