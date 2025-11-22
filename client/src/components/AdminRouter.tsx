import { Switch, Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminClients from "@/pages/AdminClients";
import AdminOperators from "@/pages/AdminOperators";
import AdminJobs from "@/pages/AdminJobs";
import AdminPlans from "@/pages/AdminPlans";

export function AdminRouter() {
  const { user, userType } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (userType && userType !== 'admin') {
      setLocation('/admin/login');
    }
  }, [userType, setLocation]);

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

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
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
    if (location === '/admin/planos') {
      return { title: "Planos de Assinatura", description: "Gerencie os planos disponíveis para clientes" };
    }
    return { title: "Dashboard", description: "" };
  };

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
                <h1 className="text-xl font-semibold">{pageInfo.title}</h1>
                {pageInfo.description && (
                  <p className="text-sm text-muted-foreground">{pageInfo.description}</p>
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
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/clientes" component={AdminClients} />
              <Route path="/admin/operadores" component={AdminOperators} />
              <Route path="/admin/vagas" component={AdminJobs} />
              <Route path="/admin/planos" component={AdminPlans} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
