// components/theme/ThemeActionHeader.tsx
"use client";

import React from "react";
import { Plus, Palette } from "lucide-react";

interface ThemeActionHeaderProps {
  onCreateTheme: () => void;
  buttonPrimaryColor: string;
}

export function ThemeActionHeader({
  onCreateTheme,
  buttonPrimaryColor,
}: ThemeActionHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Header Info */}
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{
              backgroundColor: `${buttonPrimaryColor}20`,
              border: `2px solid ${buttonPrimaryColor}40`,
            }}
          >
            <Palette className="w-6 h-6" style={{ color: buttonPrimaryColor }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Theme Management</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage and customize your application themes
            </p>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={onCreateTheme}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: buttonPrimaryColor }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Create Theme</span>
        </button>
      </div>
    </div>
  );
}