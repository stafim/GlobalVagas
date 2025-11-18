import { Building2, LayoutDashboard, Briefcase } from "lucide-react";
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
    title: "Perfil da Empresa",
    url: "/empresa/perfil",
    icon: Building2,
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
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={company?.logoUrl ? `${company.logoUrl}?t=${logoTimestamp}` : undefined} 
              alt={company?.companyName || 'Logo da empresa'} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate" data-testid="text-company-name">
              {company?.companyName || 'Empresa'}
            </h2>
            <p className="text-xs text-muted-foreground">Operlist</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
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
                      <item.icon className="h-5 w-5" />
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
