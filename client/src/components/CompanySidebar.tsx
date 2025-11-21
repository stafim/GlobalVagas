import { Building2, LayoutDashboard, Briefcase, CreditCard, Settings, Coins } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import type { Company } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard/empresa",
    icon: LayoutDashboard,
  },
  {
    title: "Minhas Vagas",
    url: "/empresa/vagas",
    icon: Briefcase,
  },
  {
    title: "Meu Plano",
    url: "/empresa/plano",
    icon: CreditCard,
  },
  {
    title: "Meus Créditos",
    url: "/empresa/creditos",
    icon: Coins,
  },
  {
    title: "Perfil da Empresa",
    url: "/empresa/perfil",
    icon: Building2,
  },
  {
    title: "Configurações",
    url: "/empresa/configuracoes",
    icon: Settings,
  },
];

export function CompanySidebar() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const company = user as Company;

  // Timestamp fixo para cache-busting do logo (só muda quando logoUrl muda)
  const logoTimestamp = useMemo(() => Date.now(), [company?.logoUrl]);

  const prefetchData = (url: string) => {
    if (url === '/empresa/vagas') {
      queryClient.prefetchQuery({
        queryKey: ['/api/jobs'],
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage 
              src={company?.logoUrl ? `${company.logoUrl}?t=${logoTimestamp}` : undefined} 
              alt={company?.companyName || 'Logo da empresa'} 
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
              <Building2 className="h-7 w-7" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate text-base" data-testid="text-company-name">
              {company?.companyName || 'Empresa'}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Área da Empresa</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-6 px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="h-11 px-4 rounded-lg font-medium"
                  >
                    <Link 
                      href={item.url}
                      onMouseEnter={() => prefetchData(item.url)}
                      onFocus={() => prefetchData(item.url)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
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
