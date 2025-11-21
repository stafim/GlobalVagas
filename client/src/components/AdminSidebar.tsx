import { LayoutDashboard, Building2, HardHat, CreditCard, DollarSign, Settings, Calendar, Image, Layers, Mail } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Meus Clientes",
    url: "/admin/clientes",
    icon: Building2,
  },
  {
    title: "Meus Operadores",
    url: "/admin/operadores",
    icon: HardHat,
  },
  {
    title: "Planos",
    url: "/admin/planos",
    icon: CreditCard,
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
  },
  {
    title: "Setores",
    url: "/admin/setores",
    icon: Layers,
  },
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
  },
  {
    title: "Feiras e Eventos",
    url: "/admin/eventos",
    icon: Calendar,
  },
  {
    title: "Banners",
    url: "/admin/banners",
    icon: Image,
  },
  {
    title: "Newsletter",
    url: "/admin/newsletter",
    icon: Mail,
  },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogoClick = () => {
    setLocation("/");
  };

  const prefetchData = (url: string) => {
    if (url === '/admin/clientes') {
      queryClient.prefetchQuery({
        queryKey: ['/api/clients'],
        staleTime: 1000 * 60 * 5,
      });
    } else if (url === '/admin/operadores') {
      queryClient.prefetchQuery({
        queryKey: ['/api/operators'],
        staleTime: 1000 * 60 * 5,
      });
    } else if (url === '/admin/planos') {
      queryClient.prefetchQuery({
        queryKey: ['/api/plans'],
        staleTime: 1000 * 60 * 5,
      });
    } else if (url === '/admin/financeiro') {
      queryClient.prefetchQuery({
        queryKey: ['/api/purchases/stats'],
        staleTime: 1000 * 60 * 5,
      });
      queryClient.prefetchQuery({
        queryKey: ['/api/purchases'],
        staleTime: 1000 * 60 * 5,
      });
    } else if (url === '/admin/newsletter') {
      queryClient.prefetchQuery({
        queryKey: ['/api/admin/newsletter-subscriptions'],
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img 
            src={operlistLogo} 
            alt="Operlist" 
            className="h-8 cursor-pointer"
            onClick={handleLogoClick}
            data-testid="logo-admin-sidebar"
          />
          <div>
            <h2 className="font-semibold">Admin</h2>
            <p className="text-xs text-muted-foreground">Operlist</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link 
                      href={item.url}
                      onMouseEnter={() => prefetchData(item.url)}
                      onFocus={() => prefetchData(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
