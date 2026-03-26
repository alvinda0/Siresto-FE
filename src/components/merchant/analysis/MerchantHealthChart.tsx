// components/merchant/analysis/MerchantHealthChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { AgentData } from '@/app/(dashboard)/merchant/analysis/page';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface MerchantHealthChartProps {
  agentData: AgentData[];
}

export default function MerchantHealthChart({ agentData }: MerchantHealthChartProps) {
  // Calculate totals
  const totalHealthy = agentData.reduce((sum, agent) => sum + agent.healthy, 0);
  const totalLowUtil = agentData.reduce((sum, agent) => sum + agent.lowUtil, 0);
  const totalOverCapacity = agentData.reduce((sum, agent) => sum + agent.overCapacity, 0); // ✅ TAMBAHAN BARU
  const totalInactive = agentData.reduce((sum, agent) => sum + agent.inactive, 0);

  const chartData = {
    labels: [
      'Healthy (>50%)', 
      'Low Util (<50%)', 
      'Over Capacity (>100%)', // ✅ TAMBAHAN BARU
      'Inactive (0%)'
    ],
    datasets: [
      {
        data: [
          totalHealthy, 
          totalLowUtil, 
          totalOverCapacity, // ✅ TAMBAHAN BARU
          totalInactive
        ],
        backgroundColor: [
          '#10b981', 
          '#f59e0b', 
          '#dc2626', // ✅ WARNA MERAH UNTUK OVER CAPACITY
          '#9ca3af'
        ],
        borderWidth: 0,
        spacing: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 12,
          font: {
            size: 13,
            weight: 500,
          },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className="w-full h-full overflow-hidden bg-white/60 backdrop-blur-md">
      <CardHeader className="border-b border-gray-200/50 pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">
          Assigned Merchant Health
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[450px] flex flex-col items-center justify-center">
        <div className="w-full max-w-[300px] h-[300px]">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}