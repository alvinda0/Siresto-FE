"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getFilteredMenuItems } from "@/constants/menuItems";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";

interface AppSidebarProps {
  activeItem?: string;
}

const AppSidebar = ({ activeItem = "Dashboard" }: AppSidebarProps) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const { data: user } = useAuthMe();
  const { 
    sidebarPrimary,
    sidebarForeground,
    sidebarPrimaryForeground,
    sidebarHeaderPrimary,
    sidebarHeaderForeground,
  } = useTheme();

  const userRole = user?.role?.name || "";
  const isInternalUser = user?.role?.type === "INTERNAL";
  
  // Use INTERNAL_MENU_ITEMS for internal users, MENU_ITEMS for external users
  const filteredMenuItems = isInternalUser 
    ? getFilteredMenuItems(userRole, true) 
    : getFilteredMenuItems(userRole);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isSubmenuActive = (submenuHref: string) => {
    return pathname.startsWith(submenuHref);
  };

  const shouldMenuBeOpen = (menuName: string, submenu?: Array<{ href: string }>) => {
    if (openMenus.includes(menuName)) return true;
    if (submenu) {
      return submenu.some((sub) => isSubmenuActive(sub.href));
    }
    return false;
  };

  const getMenuStyle = (isActive: boolean, menuKey: string) => {
    if (isActive) {
      return {
        backgroundColor: sidebarPrimary,
        color: sidebarPrimaryForeground,
      };
    }
    
    if (hoveredMenu === menuKey) {
      return {
        backgroundColor: `${sidebarPrimary}80`,
        color: sidebarPrimaryForeground,
      };
    }

    return {
      color: sidebarForeground,
      backgroundColor: "transparent",
    };
  };

  const getSubmenuStyle = (isActive: boolean, menuKey: string) => {
    if (isActive) {
      return {
        backgroundColor: `${sidebarPrimary}dd`,
        color: sidebarPrimaryForeground,
      };
    }
    
    if (hoveredMenu === menuKey) {
      return {
        backgroundColor: `${sidebarPrimary}60`,
        color: sidebarPrimaryForeground,
      };
    }

    return {
      color: sidebarForeground,
      backgroundColor: "transparent",
    };
  };

  const getIconColor = (isActive: boolean, menuKey: string) => {
    if (isActive) {
      return sidebarPrimaryForeground;
    }
    
    if (hoveredMenu === menuKey) {
      return sidebarPrimaryForeground;
    }

    return sidebarForeground;
  };

  return (
    <Sidebar 
      className="border-r bg-white" 
    >
      <SidebarHeader 
        className="px-4 py-4 border-b"
        style={{ 
          backgroundColor: sidebarHeaderPrimary,
        }}
      >
        <div className="flex items-center gap-2.5 pl-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: sidebarHeaderForeground }}
          >
            <span className="font-bold text-base" style={{ color: sidebarHeaderPrimary }}>S</span>
          </div>
          <h2 
            className="text-lg font-bold"
            style={{ color: sidebarHeaderForeground }}
          >
            Siresto
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <SidebarMenu className="gap-0.5">
          {filteredMenuItems.map((item) => {
            const isActive = activeItem === item.name;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isMenuOpen = shouldMenuBeOpen(item.name, item.submenu);
            const menuKey = `menu-${item.name}`;

            return (
              <SidebarMenuItem key={item.name}>
                {hasSubmenu ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleMenu(item.name)}
                      onMouseEnter={() => setHoveredMenu(menuKey)}
                      onMouseLeave={() => setHoveredMenu(null)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                      style={getMenuStyle(isActive || isMenuOpen, menuKey)}
                    >
                      <item.icon 
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: getIconColor(isActive || isMenuOpen, menuKey) }}
                      />
                      <span className="text-sm font-medium flex-1">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                        style={{ color: getIconColor(isActive || isMenuOpen, menuKey) }}
                      />
                    </SidebarMenuButton>

                    {isMenuOpen && (
                      <SidebarMenuSub className="mt-1 ml-4 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const subMenuKey = `submenu-${subItem.name}`;
                          const isSubActive = isSubmenuActive(subItem.href);

                          return (
                            <SidebarMenuSubItem key={subItem.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className="py-2 text-sm font-medium rounded-lg transition-all"
                                onMouseEnter={() => setHoveredMenu(subMenuKey)}
                                onMouseLeave={() => setHoveredMenu(null)}
                                style={getSubmenuStyle(isSubActive, subMenuKey)}
                              >
                                <a
                                  href={subItem.href}
                                  className="flex items-center gap-3 w-full"
                                >
                                  <subItem.icon 
                                    className="h-4 w-4"
                                    style={{ color: getIconColor(isSubActive, subMenuKey) }}
                                  />
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                    onMouseEnter={() => setHoveredMenu(menuKey)}
                    onMouseLeave={() => setHoveredMenu(null)}
                    style={getMenuStyle(isActive, menuKey)}
                  >
                    <a href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon 
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: getIconColor(isActive, menuKey) }}
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;