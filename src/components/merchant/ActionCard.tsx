// components/ActionCard.tsx
import React from "react";

export interface ActionButton {
  label: string;
  mobileLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

interface ActionCardProps {
  actions: ActionButton[];
  title?: string;
  description?: string;
}

const getVariantClasses = (
  variant: ActionButton["variant"] = "primary"
): string => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    info: "bg-indigo-600 hover:bg-indigo-700 text-white",
  };
  return variants[variant];
};

export const ActionCard: React.FC<ActionCardProps> = ({
  actions,
  title,
  description,
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/40 p-4">
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 lg:gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm ${getVariantClasses(
              action.variant
            )}`}
          >
            {action.loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="hidden sm:inline">
                  {action.loadingText || "Loading..."}
                </span>
                <span className="sm:hidden">{action.loadingText || "..."}</span>
              </>
            ) : (
              <>
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">
                  {action.mobileLabel || action.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
