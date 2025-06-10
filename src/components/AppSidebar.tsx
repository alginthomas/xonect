
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Tag,
  History,
  Palette
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'View and manage your leads'
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: FileText,
    description: 'Create and manage email templates'
  },
  {
    title: 'Import',
    url: '/import',
    icon: Upload,
    description: 'Import leads from CSV files'
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: Tag,
    description: 'Organize leads with categories'
  },
  {
    title: 'History',
    url: '/history',
    icon: History,
    description: 'View import history and batches'
  },
  {
    title: 'Branding',
    url: '/branding',
    icon: Palette,
    description: 'Customize your brand settings'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-4 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className="h-10 px-3"
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{item.title}</span>
                          <span className="text-xs text-sidebar-foreground/60 truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
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
