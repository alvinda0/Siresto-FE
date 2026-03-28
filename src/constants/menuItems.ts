// constants/menuItems.ts
import {
  LayoutDashboard,
  ArrowRightLeft,
  Store,
  Server,
  Users,
  User,
  Building2,
  Wallet,
  LayoutList,
  Building,
  Grid3x3,
  DollarSign,
  HandCoins,
  Send,
  Bell,
  FileText,
  Truck,
  BanknoteArrowDown,
  Key,
  Palette,
  BookIcon,
  Handshake,
  Clock,
  BookDashed,
  Home,
  Table2,
  ShoppingCart,
  PlusCircle,
  Package,
  FolderTree,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  name: string;
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  name: string;
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

export const INTERNAL_MENU_ITEMS: MenuItem[] = [
  // === DASHBOARD ===
  {
    name: "dashboard-internal",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "SUPPORT", "FINANCE"],
  },

  // === COMPANIES ===
  {
    name: "companies",
    title: "Companies",
    href: "/companies",
    icon: Building2,
    roles: ["SUPER_ADMIN", "SUPPORT"],
  },

  // === USERS ===
  {
    name: "users-internal",
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["SUPER_ADMIN", "SUPPORT"],
  },

  // === REPORTS ===
  {
    name: "reports-internal",
    title: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "FINANCE"],
  },

  // === AUDIT LOG ===
  {
    name: "audit-internal",
    title: "Audit Log",
    href: "/audit",
    icon: BookDashed,
    roles: ["SUPER_ADMIN", "SUPPORT", "FINANCE"],
  },

  // === SETTINGS ===
  {
    name: "settings-internal",
    title: "Settings",
    href: "/settings",
    icon: Palette,
    roles: ["SUPER_ADMIN"],
  },
];

export const EXTERNAL_MENU_ITEMS: MenuItem[] = [
  // === HOME ===
  {
    name: "home",
    title: "Home",
    href: "/home",
    icon: Home,
    roles: ["OWNER", "ADMIN", "CASHIER", "KITCHEN", "WAITER"],
  },

 

  // === MY COMPANY ===
  {
    name: "my-company",
    title: "My Company",
    href: "/my-company",
    icon: Building2,
    roles: ["OWNER", "ADMIN"],
  },

  // === BRANCHES ===
  {
    name: "branches",
    title: "Branches",
    href: "/branches",
    icon: Building,
    roles: ["OWNER", "ADMIN"],
  },

  // === USERS ===
  {
    name: "my-users",
    title: "Users",
    href: "/my-users",
    icon: Users,
    roles: ["OWNER", "ADMIN"],
  },

  // === MEJA (TABLES) ===
  {
    name: "tables",
    title: "Meja",
    href: "/tables",
    icon: Table2,
    roles: ["OWNER", "ADMIN", "WAITER"],
  },

  // === ORDER ===
  {
    name: "orders",
    title: "Daftar Order",
    href: "/orders",
    icon: ShoppingCart,
    roles: ["OWNER", "ADMIN", "CASHIER", "WAITER", "KITCHEN"],
  },

  // === CREATE ORDER ===
  {
    name: "create-order",
    title: "Buat Order",
    href: "/orders/create",
    icon: PlusCircle,
    roles: ["OWNER", "ADMIN", "CASHIER", "WAITER"],
  },

  // === PRODUK (PRODUCTS) ===
  {
    name: "products",
    title: "Produk",
    href: "/products",
    icon: Package,
    roles: ["OWNER", "ADMIN", "CASHIER", "KITCHEN", "WAITER"],
  },

  // === KATEGORI (CATEGORIES) ===
  {
    name: "categories",
    title: "Kategori",
    href: "/categories",
    icon: FolderTree,
    roles: ["OWNER", "ADMIN", "CASHIER", "KITCHEN", "WAITER"],
  },

  // === WASTE ===
  {
    name: "waste",
    title: "Waste",
    href: "/waste",
    icon: Trash2,
    roles: ["OWNER", "ADMIN", "KITCHEN"],
  },

  // === TOKO (STORE SETTINGS) ===
  {
    name: "store",
    title: "Toko",
    href: "/store",
    icon: ShoppingBag,
    roles: ["OWNER", "ADMIN"],
  },

  // === ACTIVITY LOGS ===
  {
    name: "logs",
    title: "Activity Logs",
    href: "/logs",
    icon: BookDashed,
    roles: ["OWNER", "ADMIN"],
  },
];

// Legacy export for backward compatibility
export const MENU_ITEMS: MenuItem[] = EXTERNAL_MENU_ITEMS;

// Helper function untuk check apakah user punya akses ke menu
export const hasMenuAccess = (
  menuRoles?: string[],
  userRole?: string
): boolean => {
  // Jika menu tidak ada role requirement, berarti semua bisa akses
  if (!menuRoles || menuRoles.length === 0) {
    return true;
  }

  // Jika user tidak ada role, tidak bisa akses
  if (!userRole) {
    return false;
  }

  // Check apakah role user match dengan role requirement menu (case-insensitive)
  return menuRoles.some(
    (menuRole) => menuRole.toLowerCase() === userRole.toLowerCase()
  );
};

// Filter menu items berdasarkan role user
// Updated: menerima userRole sebagai string langsung dari API (role_name)
export const getFilteredMenuItems = (userRole?: string, isInternal: boolean = false): MenuItem[] => {
  const menuItems = isInternal ? INTERNAL_MENU_ITEMS : EXTERNAL_MENU_ITEMS;
  
  return menuItems.filter((item) => {
    // Check akses ke main menu
    const hasMainMenuAccess = hasMenuAccess(item.roles, userRole);

    // Jika tidak ada akses ke main menu, skip langsung
    if (!hasMainMenuAccess) {
      return false;
    }

    return true;
  }).map((item) => {
    // Filter submenu untuk item yang lolos
    if (item.submenu) {
      return {
        ...item,
        submenu: item.submenu.filter((subItem) =>
          hasMenuAccess(subItem.roles, userRole)
        ),
      };
    }
    return item;
  });
};

// Get menu item by name
export const getMenuItemByName = (name: string, isInternal: boolean = false): MenuItem | undefined => {
  const menuItems = isInternal ? INTERNAL_MENU_ITEMS : EXTERNAL_MENU_ITEMS;
  return menuItems.find((item) => item.name === name);
};

// Get menu item by current pathname
export const getMenuItemByPath = (
  pathname: string,
  isInternal: boolean = false
): { menuItem: MenuItem | undefined; subMenuItem: SubMenuItem | undefined } => {
  const menuItems = isInternal ? INTERNAL_MENU_ITEMS : EXTERNAL_MENU_ITEMS;
  
  // First: Try exact match untuk main menu
  for (const item of menuItems) {
    if (pathname === item.href) {
      return { menuItem: item, subMenuItem: undefined };
    }

    // Check submenu exact match
    if (item.submenu) {
      for (const subItem of item.submenu) {
        if (pathname === subItem.href) {
          return { menuItem: item, subMenuItem: subItem };
        }
      }
    }
  }

  // Second: Try partial match (untuk detail pages, edit pages, dll)
  for (const item of menuItems) {
    // Check apakah pathname dimulai dengan href menu (contoh: /users/detail/123 starts with /users)
    if (pathname.startsWith(item.href + "/")) {
      // Check dulu apakah ada submenu yang lebih spesifik
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (pathname.startsWith(subItem.href + "/")) {
            return { menuItem: item, subMenuItem: subItem };
          }
        }
      }
      // Jika tidak ada submenu yang match, return main menu
      return { menuItem: item, subMenuItem: undefined };
    }

    // Check submenu partial match
    if (item.submenu) {
      for (const subItem of item.submenu) {
        if (pathname.startsWith(subItem.href + "/")) {
          return { menuItem: item, subMenuItem: subItem };
        }
      }
    }
  }

  return { menuItem: undefined, subMenuItem: undefined };
};

// Get menu items with active status
export const getMenuItemsWithActiveStatus = (activeMenuItem: string, isInternal: boolean = false) => {
  const menuItems = isInternal ? INTERNAL_MENU_ITEMS : EXTERNAL_MENU_ITEMS;
  return menuItems.map((item) => ({
    ...item,
    active: activeMenuItem === item.name,
  }));
};