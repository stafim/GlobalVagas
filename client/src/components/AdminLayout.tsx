import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, userType } = useAuth();
  const [, setLocation] = useLocation();
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

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {!description && user && (user as any).email && (
                  <p className="text-sm text-muted-foreground">{(user as any).email}</p>
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
