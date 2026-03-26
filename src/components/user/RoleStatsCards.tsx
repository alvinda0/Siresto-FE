// components/user/RoleStatsCards.tsx
"use client";

import React from "react";
import { Users } from "lucide-react";

interface RoleStatsCardsProps {
  roleStats: { [key: string]: number } | null;
}

export function RoleStatsCards({ roleStats }: RoleStatsCardsProps) {
  if (!roleStats) return null;

  const colors = [
    {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: "bg-blue-400/30",
      text: "text-white",
      border: "border-blue-300",
    },
    {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      icon: "bg-green-400/30",
      text: "text-white",
      border: "border-green-300",
    },
    {
      bg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      icon: "bg-cyan-400/30",
      text: "text-white",
      border: "border-cyan-300",
    },
    {
      bg: "bg-gradient-to-br from-teal-500 to-teal-600",
      icon: "bg-teal-400/30",
      text: "text-white",
      border: "border-teal-300",
    },
    {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: "bg-emerald-400/30",
      text: "text-white",
      border: "border-emerald-300",
    },
    {
      bg: "bg-gradient-to-br from-sky-500 to-sky-600",
      icon: "bg-sky-400/30",
      text: "text-white",
      border: "border-sky-300",
    },
    {
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      icon: "bg-indigo-400/30",
      text: "text-white",
      border: "border-indigo-300",
    },
    {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      icon: "bg-purple-400/30",
      text: "text-white",
      border: "border-purple-300",
    },
    {
      bg: "bg-gradient-to-br from-pink-500 to-pink-600",
      icon: "bg-pink-400/30",
      text: "text-white",
      border: "border-pink-300",
    },
    {
      bg: "bg-gradient-to-br from-rose-500 to-rose-600",
      icon: "bg-rose-400/30",
      text: "text-white",
      border: "border-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Object.entries(roleStats).map(([roleName, count], index) => {
        const colorScheme = colors[index % colors.length];

        return (
          <div
            key={roleName}
            className={`${colorScheme.bg} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border ${colorScheme.border}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`${colorScheme.icon} w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0`}
              >
                <Users className={`w-6 h-6 ${colorScheme.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${colorScheme.text} opacity-90 truncate mb-0.5`}
                  title={roleName}
                >
                  {roleName}
                </p>
                <p className={`text-2xl font-bold ${colorScheme.text}`}>
                  {count}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}