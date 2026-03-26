// components/disbursement-platform/DisbursementPlatformStatisticsCard.tsx
"use client";

import React from "react";
import { Wallet, TrendingUp, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DisbursementPlatformSummary,
  DisbursementPlatformTotal,
} from "@/types/disbursement-platform";

interface StatCardProps {
  title: string;
  count: number;
  amount: number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  amount,
  icon: Icon,
  bgColor,
  iconColor,
}) => {
  return (
    <div className={`${bgColor} rounded-lg border border-gray-200 px-3 py-2.5`}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`p-2 ${iconColor} bg-opacity-10 rounded-lg shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-gray-600 uppercase truncate">
            {title}
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(amount)}
            </p>
            <span className="text-xs text-gray-500">({count})</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 italic">This month only</p>
        </div>
      </div>
    </div>
  );
};

interface DisbursementPlatformStatisticsCardProps {
  summary: DisbursementPlatformSummary[];
  total: DisbursementPlatformTotal | null;
  loading?: boolean;
}

export const DisbursementPlatformStatisticsCard: React.FC <
  DisbursementPlatformStatisticsCardProps
> = ({ summary, total, loading = false }) => {
  const statusColors: Record <
    string,
    { bgColor: string; iconColor: string; icon: LucideIcon }
  > = {
    PENDING: {
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      icon: TrendingUp,
    },
    PROCESSING: {
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: TrendingUp,
    },
    APPROVED: {
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      icon: TrendingUp,
    },
    REJECTED: {
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      icon: TrendingUp,
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2.5 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-16 mb-1.5"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Gabungkan total dengan summary untuk ditampilkan
  const allStats = [];

  // Tambahkan total card
  if (total) {
    allStats.push({
      title: "Total Disbursements",
      count: total.count,
      amount: total.total_disbursement,
      icon: Wallet,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    });
  }

  // Tambahkan summary cards
  summary.forEach((item) => {
    const config = statusColors[item.status] || statusColors.PENDING;
    allStats.push({
      title: item.status,
      count: item.count,
      amount: item.total_disbursement,
      icon: config.icon,
      bgColor: config.bgColor,
      iconColor: config.iconColor,
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {allStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          count={stat.count}
          amount={stat.amount}
          icon={stat.icon}
          bgColor={stat.bgColor}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
};