// components/ErrorState.tsx
import { AlertCircle, Lock, ServerCrash, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

type ErrorCode = 400 | 401 | 403 | 404 | 500;

interface ErrorStateProps {
  code: ErrorCode;
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const ERROR_CONFIG = {
  400: {
    icon: XCircle,
    title: "Bad Request",
    description: "The request could not be understood by the server. Please check your input and try again.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  401: {
    icon: Lock,
    title: "Unauthorized",
    description: "You need to be authenticated to access this resource. Please login to continue.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  403: {
    icon: ShieldAlert,
    title: "Access Forbidden",
    description: "You don't have permission to access this resource. Contact administrator if you believe this is an error.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  404: {
    icon: AlertCircle,
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  500: {
    icon: ServerCrash,
    title: "Server Error",
    description: "Something went wrong on our end. We're working to fix it. Please try again later.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
};

export function ErrorState({
  code,
  title,
  description,
  onAction,
  actionLabel = "Go Back",
}: ErrorStateProps) {
  const { buttonPrimaryColor } = useTheme();
  const config = ERROR_CONFIG[code];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`${config.bgColor} rounded-full p-4`}>
            <Icon className={`w-12 h-12 ${config.color}`} strokeWidth={2} />
          </div>
        </div>

        {/* Error Code Badge */}
        <div className="text-center mb-4">
          <span className="inline-block bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-700">
            Error {code}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {title || config.title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          {description || config.description}
        </p>

        {/* Action Button with Theme Primary Color */}
        {onAction && (
          <Button
            onClick={onAction}
            style={{ backgroundColor: buttonPrimaryColor }}
            className="w-full text-white font-semibold py-6 rounded-xl transition-all hover:opacity-90"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}