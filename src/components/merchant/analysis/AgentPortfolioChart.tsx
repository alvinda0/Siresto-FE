// components/merchant/analysis/AgentPortfolioChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AgentData } from '@/app/(dashboard)/merchant/analysis/page';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AgentPortfolioChartProps {
  agentData: AgentData[];
}

export default function AgentPortfolioChart({ agentData }: AgentPortfolioChartProps) {
  const chartData = {
    labels: agentData.map(agent => agent.agentName),
    datasets: [
      {
        label: 'Healthy (>50%)',
        data: agentData.map(agent => agent.healthy),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Low Util (<50%)',
        data: agentData.map(agent => agent.lowUtil),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
      // ✅ DATASET BARU: OVER CAPACITY
      {
        label: 'Over Capacity (>100%)',
        data: agentData.map(agent => agent.overCapacity),
        backgroundColor: '#dc2626',
        borderRadius: 4,
      },
      {
        label: 'Inactive (0%)',
        data: agentData.map(agent => agent.inactive),
        backgroundColor: '#9ca3af',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 3,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 15,
          font: {
            size: 13,
            weight: 500,
          },
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} merchants`;
          },
        },
      },
    },
  };

  return (
    <Card className="w-full h-full overflow-hidden bg-white/60 backdrop-blur-md">
      <CardHeader className="border-b border-gray-200/50 pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">
          Agent Portfolio Utilization Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[450px]">
        <div className="h-full w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}