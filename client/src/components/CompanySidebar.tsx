import { Building2, LayoutDashboard, Briefcase, CreditCard, Settings, Coins, ChevronDown, FileQuestion } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    icon: Settings,
    subItems: [
      {
        title: "Banco de Perguntas",
        url: "/empresa/banco-perguntas",
        icon: FileQuestion,
      },
    ],
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
              {menuItems.map((item) => {
                // Item com submenu
                if ('subItems' in item && item.subItems) {
                  const isAnySubItemActive = item.subItems.some(sub => location === sub.url);
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isAnySubItemActive}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="h-11 px-4 rounded-lg font-medium"
                            data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 mt-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location === subItem.url}
                                  className="h-10 px-4 rounded-lg"
                                  data-testid={`sidebar-${subItem.title.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  <Link href={subItem.url}>
                                    <subItem.icon className="h-4 w-4 mr-3" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
                // Item normal sem submenu
                return (
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
