// components/merchant/analysis/StatisticCard.tsx
'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatisticCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  borderColor: string;
  iconColor: string;
  iconBgColor: string;
}

export default function StatisticCard({
  title,
  value,
  subtitle,
  icon: Icon,
  borderColor,
  iconColor,
  iconBgColor,
}: StatisticCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden bg-white/60 backdrop-blur-md border-l-4 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {value}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={`${iconBgColor} p-2 rounded-lg shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </div>
    </Card>
  );
}