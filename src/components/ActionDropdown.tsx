// components/ActionDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192px = w-48
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={action.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  action.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 cursor-pointer"
                } ${action.className || "text-gray-700"}`}
              >
                {action.icon}
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};
