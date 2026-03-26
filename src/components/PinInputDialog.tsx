import React, { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, AlertTriangle, CheckCircle, Info } from "lucide-react";

type ActionType = "delete" | "create" | "update" | "confirm";

interface PinInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  actionType?: ActionType;
  actionLabel?: string;
  loadingLabel?: string;
}

const PinInputDialog: React.FC<PinInputDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
  actionType = "confirm",
  actionLabel,
  loadingLabel,
}) => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Action type configurations
  const actionConfig = {
    delete: {
      icon: AlertTriangle,
      iconColor: "text-red-600",
      iconBg: "bg-red-500/10",
      iconBorder: "border-red-500/30",
      buttonColor: "bg-red-500 hover:bg-red-600",
      defaultLabel: "Delete",
      defaultLoadingLabel: "Deleting...",
      warningColor: "text-red-600",
    },
    create: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-500/10",
      iconBorder: "border-green-500/30",
      buttonColor: "bg-green-500 hover:bg-green-600",
      defaultLabel: "Create",
      defaultLoadingLabel: "Creating...",
      warningColor: "text-green-600",
    },
    update: {
      icon: CheckCircle,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-500/10",
      iconBorder: "border-blue-500/30",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      defaultLabel: "Update",
      defaultLoadingLabel: "Updating...",
      warningColor: "text-blue-600",
    },
    confirm: {
      icon: Info,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-500/10",
      iconBorder: "border-blue-500/30",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      defaultLabel: "Confirm",
      defaultLoadingLabel: "Processing...",
      warningColor: "text-blue-600",
    },
  };

  const config = actionConfig[actionType];
  const IconComponent = config.icon;
  const finalActionLabel = actionLabel || config.defaultLabel;
  const finalLoadingLabel = loadingLabel || config.defaultLoadingLabel;

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleConfirm = () => {
    const pinValue = pin.join("");
    if (pinValue.length === 6) {
      onConfirm(pinValue);
    }
  };

  const isPinComplete = pin.every((digit) => digit !== "");

  // Default description based on action type
  const getDefaultDescription = () => {
    if (description) return description;

    const itemText = itemName ? `"${itemName}"` : "this action";

    switch (actionType) {
      case "delete":
        return (
          <>
            Are you sure you want to delete {itemText}?
            <br />
            <span className={`${config.warningColor} font-semibold`}>
              This action cannot be undone.
            </span>
          </>
        );
      case "create":
        return `Please confirm to create ${itemText}.`;
      case "update":
        return `Please confirm to update ${itemText}.`;
      default:
        return `Please confirm ${itemText}.`;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center border ${config.iconBorder}`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed">
            {getDefaultDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">
              Enter your 6-digit PIN to confirm
            </label>
          </div>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50 backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 border border-gray-500/30 font-semibold"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !isPinComplete}
            className={`${config.buttonColor} text-white border-0 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{finalLoadingLabel}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span>{finalActionLabel}</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PinInputDialog;