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
  Tags,
  DollarSign,
  HandCoins,
  Send,
  Coins,
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
    href: "/internal",
    icon: LayoutDashboard,
  },

  // === COMPANIES ===
  {
    name: "companies",
    title: "Companies",
    href: "/internal/companies",
    icon: Building2,
  },

  // === USERS ===
  {
    name: "users-internal",
    title: "Users",
    href: "/internal/users",
    icon: Users,
  },

  // === REPORTS ===
  {
    name: "reports-internal",
    title: "Reports",
    href: "/internal/reports",
    icon: FileText,
  },

  // === AUDIT LOG ===
  {
    name: "audit-internal",
    title: "Audit Log",
    href: "/internal/audit",
    icon: BookDashed,
  },

  // === SETTINGS ===
  {
    name: "settings-internal",
    title: "Settings",
    href: "/internal/settings",
    icon: Palette,
  },
];

export const MENU_ITEMS: MenuItem[] = [
  // === DASHBOARD ===
  {
    name: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Superuser", "Supervisor", "StaffFinance", "StaffEntry"],
  },

  // === REPORT ===
  {
    name: "report",
    title: "Reports & Analytics",
    href: "/report",
    icon: BookDashed,
    roles: ["Superuser", "Supervisor", "StaffFinance"],
  },

  // === TRANSACTION ===
  {
    name: "transaction",
    title: "Transaction",
    href: "/transaction",
    icon: ArrowRightLeft,
    roles: ["Superuser", "Supervisor","StaffEntry","StaffFinance"],
  },


  // === WALLET ===
  {
    name: "wallet",
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
    roles: ["Superuser", "Supervisor", "StaffFinance"],
    submenu: [
      {
        name: "wallet-platform",
        title: "Platform",
        href: "/wallet/platform",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
      {
        name: "wallet-merchant",
        title: "Merchant",
        href: "/wallet/merchant",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
    ],
  },

  // === DISBURSEMENT ===
  {
    name: "disbursement-idr",
    title: "Disbursement IDR",
    href: "/disbursement/idr",
    icon: BanknoteArrowDown,
    roles: ["Superuser", "Supervisor", "StaffFinance"],
    submenu: [
      {
        name: "disbursement-platform",
        title: "Platform",
        href: "/disbursement/idr/platform/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
      {
        name: "disbursement-merchant",
        title: "Merchant",
        href: "/disbursement/idr/merchant/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
    ],
  },
  // === DISBURSEMENT USDT===
  {
    name: "disbursement-usdt",
    title: "Disbursement USDT",
    href: "/disbursement/usdt",
    icon: BanknoteArrowDown,
    roles: ["Superuser", "Supervisor", "StaffFinance"],
  },

   // === TRANSFER ===
  {
    name: "transfer",
    title: "Transfer",
    href: "/transfer",
    icon: Send,
    roles: ["Superuser", "Supervisor", "StaffFinance", "StaffEntry"],
  },

  // === SETTLEMENT ===
  {
    name: "settlement",
    title: "Settlement",
    href: "/settlement",
    icon: HandCoins,
    roles: ["Superuser", "Supervisor", "StaffFinance"],
    submenu: [
      {
        name: "settlement-platform",
        title: "Platform",
        href: "/settlement/platform",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
      {
        name: "settlement-merchant",
        title: "Merchant",
        href: "/settlement/merchant",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
    ],
  },

  // === USER MANAGEMENT ===
  {
    name: "users",
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["Superuser", "Supervisor", "StaffEntry"],
    submenu: [
      {
        name: "users-list",
        title: "User List",
        href: "/users/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "users-blocked",
        title: "Blocked Users",
        href: "/users/blocked",
        icon: User,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
    ],
  },

  
  // === PARTNER DASHBOARD ===

  {
    name: "partners",
    title: "Partner",
    href: "/partner",
    icon: Handshake,
    roles: ["Superuser", "Supervisor"],
  },

  // === PLATFORM MANAGEMENT ===

  {
    name: "platform-list",
    title: "Platform",
    href: "/platforms",
    icon: Server,
    roles: ["StaffEntry"],
    submenu: [
      {
        name: "platform-list",
        title: "Platform List",
        href: "/platforms/list",
        icon: LayoutList,
        roles: ["StaffEntry"],
      },
      {
        name: "platform-bank",
        title: "Platform Bank",
        href: "/platforms/bank",
        icon: Building,
        roles: ["StaffEntry"],
      },
    ],
  },

  {
    name: "platform-bank",
    title: "Bank Platform",
    href: "/platforms/bank",
    icon: Building,
    roles: ["StaffFinance"],
  },

  {
    name: "platforms",
    title: "Platforms",
    href: "/platforms",
    icon: Server,
    roles: ["Superuser", "Supervisor"],
    submenu: [
      {
        name: "platform-list",
        title: "Platform List",
        href: "/platforms/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor"],
      },
      {
        name: "platform-bank",
        title: "Platform Bank",
        href: "/platforms/bank",
        icon: Building,
        roles: ["Superuser", "Supervisor"],
      },
    ],
  },

  // === MERCHANT MANAGEMENT ===
  {
    name: "merchant",
    title: "Merchant",
    href: "/merchant",
    icon: Store,
    roles: ["Superuser", "Supervisor", "StaffEntry", "StaffFinance"],
    submenu: [
      {
        name: "merchant-list",
        title: "List Merchant",
        href: "/merchant/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "merchant-analysis",
        title: "Merchant Analysis",
        href: "/merchant/analysis",
        icon: LayoutDashboard,
        roles: ["Superuser", "Supervisor", "StaffEntry", "StaffFinance"],
      },
      {
        name: "merchant-requests",
        title: "Merchant Requests",
        href: "/merchant/requests",
        icon: Clock,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "merchant-bank",
        title: "Bank Merchant",
        href: "/merchant/bank",
        icon: Building,
        roles: ["Superuser", "Supervisor", "StaffFinance", "StaffEntry"],
      },
      {
        name: "merchant-type",
        title: "Merchant Type",
        href: "/merchant/type",
        icon: Grid3x3,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "merchant-fee",
        title: "Merchant Fee",
        href: "/merchant/fee",
        icon: DollarSign,
        roles: ["Superuser", "Supervisor", "StaffFinance"],
      },
    ],
  },

  // === AGENT MANAGEMENT ===
  {
    name: "agent",
    title: "Agent",
    href: "/agent",
    icon: Building2,
    roles: ["Superuser", "Supervisor", "StaffEntry"],
    submenu: [
      {
        name: "agent-list",
        title: "Agent List",
        href: "/agent/list",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "agent-type",
        title: "Agent Type",
        href: "/agent/type",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
    ],
  },

  {
    name: "script",
    title: "Script Engine",
    href: "/script",
    icon: BookIcon,
    roles: ["Superuser", "Supervisor", "StaffEntry"],
  },

  // ===  CREDENTIALS ===
  {
    name: "credentials",
    title: "Credentials",
    href: "/credentials",
    icon: Key,
    roles: ["Superuser", "Supervisor", "StaffEntry"],
    submenu: [
      {
        name: "credentials-agent",
        title: "Credentials Agent",
        href: "/credentials/agent",
        icon: LayoutList,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
      {
        name: "credentials-merchant",
        title: "Credentials Merchant",
        href: "/credentials/merchant",
        icon: Grid3x3,
        roles: ["Superuser", "Supervisor", "StaffEntry"],
      },
    ],
  },

  // === VENDOR ===
  {
    name: "vendor",
    title: "Vendor",
    href: "/vendor",
    icon: Truck,
    roles: ["Superuser", "Supervisor"],
  },

  // === ANNOUNCEMENT ===
  {
    name: "announcements",
    title: "Announcement",
    href: "/announcements",
    icon: Bell,
    roles: ["Superuser", "Supervisor", "StaffFinance", "StaffEntry"],
  },

  // === THEME ===
  {
    name: "theme",
    title: "Theme",
    href: "/theme",
    icon: Palette,
    roles: ["Superuser", "Supervisor"],
  },

  // === AUDIT MANAGEMENT ===
  {
    name: "audit",
    title: "Audit Log",
    href: "/audit-log",
    icon: FileText,
    roles: ["Superuser", "Supervisor"],
  },
];

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
export const getFilteredMenuItems = (userRole?: string): MenuItem[] => {
  return MENU_ITEMS.filter((item) => {
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
export const getMenuItemByName = (name: string): MenuItem | undefined => {
  return MENU_ITEMS.find((item) => item.name === name);
};

// Get menu item by current pathname
export const getMenuItemByPath = (
  pathname: string
): { menuItem: MenuItem | undefined; subMenuItem: SubMenuItem | undefined } => {
  // First: Try exact match untuk main menu
  for (const item of MENU_ITEMS) {
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
  for (const item of MENU_ITEMS) {
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
export const getMenuItemsWithActiveStatus = (activeMenuItem: string) => {
  return MENU_ITEMS.map((item) => ({
    ...item,
    active: activeMenuItem === item.name,
  }));
};