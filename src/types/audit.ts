// types/audit.ts

export interface AuditLog {
  id: string;
  request_id: string;
  user_id: string;
  username?: string;
  session_id: string;
  action: string;
  resource: string;
  resource_id: string;
  details?: {
    message?: string;
    [key: string]: any;
  };
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  resource?: string;
  action?: string;
}

// Action Types
export type ActionType = 
  | "LOGIN"
  | "LOGOUT" 
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "PASSWORD_RESET"
  | "2FA_SETUP"
  | "2FA_DISABLE"
  | "2FA_RESET"
  | "PIN_RESET"
  | "TRANSFER"
  | "DEPOSIT"
  | "WITHDRAW";

// Resource Types
export type ResourceType = 
  | "AUTH"
  | "2FA"
  | "USER"
  | "ROLE"
  | "VENDOR"
  | "FEE"
  | "BANK"
  | "PARTNER"
  | "INTERNAL_PLATFORM"
  | "AGENT"
  | "MERCHANT"
  | "WALLET_MERCHANT"
  | "WALLET_PLATFORM"
  | "BANK_MERCHANT"
  | "BANK_PLATFORM"
  | "SETTLEMENT"
  | "DISBURSEMENTS"
  | "TRANSACTIONS"
  | "ANNOUNCEMENT"
  | "THEME"
  | "ENGINE";

export const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "CREATE", label: "Create" },
  { value: "READ", label: "Read" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "2FA_SETUP", label: "2FA Setup" },
  { value: "2FA_DISABLE", label: "2FA Disable" },
  { value: "2FA_RESET", label: "2FA Reset" },
  { value: "PIN_RESET", label: "PIN Reset" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAW", label: "Withdraw" },
];

export const RESOURCE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: "AUTH", label: "Authentication" },
  { value: "2FA", label: "Two Factor Auth" },
  { value: "USER", label: "User" },
  { value: "ROLE", label: "Role" },
  { value: "VENDOR", label: "Vendor" },
  { value: "FEE", label: "Fee" },
  { value: "BANK", label: "Bank" },
  { value: "PARTNER", label: "Partner" },
  { value: "INTERNAL_PLATFORM", label: "Internal Platform" },
  { value: "AGENT", label: "Agent" },
  { value: "MERCHANT", label: "Merchant" },
  { value: "WALLET_MERCHANT", label: "Wallet Merchant" },
  { value: "WALLET_PLATFORM", label: "Wallet Platform" },
  { value: "BANK_MERCHANT", label: "Bank Merchant" },
  { value: "BANK_PLATFORM", label: "Bank Platform" },
  { value: "SETTLEMENT", label: "Settlement" },
  { value: "DISBURSEMENTS", label: "Disbursements" },
  { value: "TRANSACTIONS", label: "Transactions" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "THEME", label: "Theme" },
  { value: "ENGINE", label: "Engine" },
];

export interface AuditLogResponse {
  success: boolean;
  message: string;
  data: AuditLog[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SingleAuditLogResponse {
  success: boolean;
  message: string;
  data: AuditLog;
}