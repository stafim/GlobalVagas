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

  const prefetchData = (url: string) => {
    if (url === '/empresa/vagas') {
      queryClient.prefetchQuery({
        queryKey: ['/api/company/jobs'],
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-md">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Empresa</h2>
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
