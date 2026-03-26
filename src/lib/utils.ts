import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.trunc(amount));
}

// utils/error.ts
export interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
        details?: string;
        code?: string;
      };
      message?: string;
      success?: boolean;
      status?: number;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
}

export const getErrorMessage = (err: unknown): string => {
  const error = err as ApiError;
  
  // Handle API error responses with specific structure
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check for error.message first (most specific) - hanya ambil message, bukan code
    if (data.error?.message) {
      return data.error.message;
    }
    
    // Check for error.details
    if (data.error?.details) {
      return data.error.details;
    }
    
    // Check for direct message
    if (data.message) {
      return data.message;
    }
  }
  
  // Fallback - hindari menampilkan HTTP status code atau error code
  if (error.message && !error.message.includes('status code') && !error.message.includes('Request failed')) {
    return error.message;
  }
  
  return "An error occurred. Please try again.";
};