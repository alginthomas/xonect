
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Upload,
  FolderOpen,
  Mail
} from 'lucide-react';

const navigation = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: Users,
  },
  {
    title: 'Import',
    url: '/import',
    icon: Upload,
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: FolderOpen,
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: Mail,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">L</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">LeadManager</span>
            </div>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`
                    }
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
