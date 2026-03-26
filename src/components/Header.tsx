// components/Header.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  MenuSquare,
  PanelRightClose,
  LogOut,
  User,
  UserLock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authService } from "@/services/auth.service";
import { getFilteredMenuItems, getMenuItemByPath } from "@/constants/menuItems";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";

const Divider = ({ className = "my-2" }: { className?: string }) => (
  <div className={`border-t border-gray-200 ${className}`} />
);

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpenMenus, setMobileOpenMenus] = useState<string[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: user } = useAuthMe();
  const { 
    primaryColor,
    primaryTextColor,
    secondaryTextColor,
    headerPrimary,
    headerForeground,
    sidebarHeaderPrimary,
    sidebarHeaderForeground,
  } = useTheme();

  const { menuItem, subMenuItem } = getMenuItemByPath(pathname);
  const currentTitle = subMenuItem?.title || menuItem?.title || "Dashboard";
  const currentMenuName = menuItem?.name || "Dashboard";

  const userName = user?.name || "User";
  const userRole = user?.role?.name || "User";

  const filteredMenuItems = getFilteredMenuItems(userRole);

  const toggleMobileMenu = (menuName: string) => {
    setMobileOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMobileSubmenuActive = (submenuHref: string) => {
    return pathname.startsWith(submenuHref);
  };

  const shouldMobileMenuBeOpen = (
    menuName: string,
    submenu?: Array<{ href: string }>
  ) => {
    if (mobileOpenMenus.includes(menuName)) return true;
    if (submenu) {
      return submenu.some((sub) => isMobileSubmenuActive(sub.href));
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      authService.logout();
      queryClient.clear(); // Clear all React Query cache
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      queryClient.clear(); // Clear cache even on error
      router.push("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangePassword = () => {
    router.push("/profile/change-password");
    setIsMobileProfileOpen(false);
  };

  const handleProfile = () => {
    router.push("/profile");
    setIsMobileProfileOpen(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex w-full h-16 px-6 items-center justify-between bg-white border-b">
        <div className="flex flex-col">
          <h1 
            className="text-lg font-bold leading-none"
            style={{ color: primaryTextColor }}
          >
            {currentTitle}
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Siresto Dashboard</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 transition-all focus:outline-none hover:opacity-90"
            style={{
              backgroundColor: headerPrimary,
              color: headerForeground,
            }}
          >
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-3 shadow-lg rounded-xl bg-white border border-gray-200"
          >
            <div className="space-y-2">
              <div className="px-3 py-2.5 rounded-lg bg-gray-50">
                <p className="text-sm font-bold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{userRole}</p>
              </div>

              <div className="space-y-1 pt-1">
                <button
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleProfile}
                >
                  <User className="w-4 h-4 mr-2.5 text-gray-500" />
                  <span>Profile</span>
                </button>

                <button
                  className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleChangePassword}
                >
                  <UserLock className="w-4 h-4 mr-2.5 text-gray-500" />
                  <span>Change Password</span>
                </button>
              </div>

              <Divider className="my-2" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden w-full h-16 px-4 flex items-center justify-between shadow-md border-b bg-white">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md" style={{ backgroundColor: `${primaryColor}15` }}>
              <MenuSquare 
                className="h-5 w-5" 
                style={{ color: primaryColor }} 
              />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-white">
            <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
            <div className="flex flex-col h-full">
              <div
                className="flex-shrink-0 p-6 shadow-md"
                style={{
                  backgroundColor: sidebarHeaderPrimary,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: 'white', opacity: 0.9 }}
                    >
                      <span className="font-bold text-lg" style={{ color: sidebarHeaderPrimary }}>S</span>
                    </div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: sidebarHeaderForeground }}
                    >
                      Siresto
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl transition-all hover:bg-white/10"
                  >
                    <PanelRightClose
                      className="h-6 w-6"
                      style={{ color: sidebarHeaderForeground }}
                    />
                  </button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-2 bg-white">
                {filteredMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentMenuName === item.name;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isMenuOpen = shouldMobileMenuBeOpen(
                    item.name,
                    item.submenu
                  );

                  return (
                    <div key={item.name}>
                      {hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleMobileMenu(item.name)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all border"
                            style={
                              isActive || isMenuOpen
                                ? {
                                    backgroundColor: primaryColor,
                                    color: secondaryTextColor,
                                    borderColor: primaryColor,
                                  }
                                : {
                                    color: primaryTextColor,
                                    backgroundColor: '#fff',
                                    borderColor: '#e5e7eb',
                                  }
                            }
                          >
                            <div className="flex items-center">
                              <IconComponent className="w-5 h-5 mr-3" />
                              <span className="font-bold text-sm">
                                {item.title}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isMenuOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isMenuOpen && (
                            <div className="mt-2 ml-4 space-y-1">
                              {item.submenu?.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="flex items-center px-4 py-2.5 rounded-xl transition-all text-sm border"
                                  style={
                                    isMobileSubmenuActive(subItem.href)
                                      ? {
                                          backgroundColor: `${primaryColor}dd`,
                                          color: secondaryTextColor,
                                          borderColor: primaryColor,
                                        }
                                      : {
                                          color: primaryTextColor,
                                          backgroundColor: '#fff',
                                          borderColor: '#e5e7eb',
                                        }
                                  }
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <subItem.icon className="w-4 h-4 mr-3" />
                                  <span className="font-semibold">
                                    {subItem.title}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center px-4 py-3 rounded-xl transition-all border"
                          style={
                            isActive
                              ? {
                                  backgroundColor: primaryColor,
                                  color: secondaryTextColor,
                                  borderColor: primaryColor,
                                }
                              : {
                                  color: primaryTextColor,
                                  backgroundColor: '#fff',
                                  borderColor: '#e5e7eb',
                                }
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <IconComponent className="w-5 h-5 mr-3" />
                          <span className="font-bold">{item.title}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet
          open={isMobileProfileOpen}
          onOpenChange={setIsMobileProfileOpen}
        >
          <SheetTrigger asChild>
            <button
              className="px-3 py-2 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              style={{
                backgroundColor: headerPrimary,
                color: headerForeground,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span>{userName}</span>
              </div>
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-80 p-0 bg-white">
            <SheetTitle className="sr-only">User Profile</SheetTitle>
            <div className="flex flex-col h-full p-6">
              <div
                className="mb-6 pb-4 px-5 py-4 rounded-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-6 w-6" style={{ color: secondaryTextColor }} />
                  </div>
                  <div>
                    <span
                      className="text-base font-bold block"
                      style={{ color: secondaryTextColor }}
                    >
                      {userName}
                    </span>
                    <span
                      className="text-sm font-medium opacity-90"
                      style={{ color: secondaryTextColor }}
                    >
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 mb-6">
                <button
                  className="flex items-center w-full px-4 py-3 rounded-xl transition-all bg-gray-50 hover:bg-gray-100"
                  onClick={handleProfile}
                  style={{ color: primaryTextColor }}
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold">Profile</span>
                </button>

                <button
                  className="flex items-center w-full px-4 py-3 rounded-xl transition-all bg-gray-50 hover:bg-gray-100"
                  onClick={handleChangePassword}
                  style={{ color: primaryTextColor }}
                >
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center mr-3">
                    <UserLock className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold">Change Password</span>
                </button>
              </nav>

              <Divider className="mb-6" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-bold transition-all text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
};

export default Header;