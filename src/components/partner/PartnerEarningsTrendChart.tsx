"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

import { Chart } from "react-chartjs-2";
import { useMemo } from "react";
import { GroupedTransactionRow } from "@/components/analytics/types";

const formatCurrency = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const formatYAxisLabel = (value: number) => {
  if (value === 0) return "0";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
};

export const PartnerEarningsTrendChart = ({
  rows,
  partnerShare,
  qrisFeeRate,
  agentCommissionRate,
}: {
  rows: GroupedTransactionRow[];
  partnerShare: number;
  qrisFeeRate: number;
  agentCommissionRate: number;
}) => {
  const chartData = useMemo(() => {
    const dailyMap = new Map<string, number>();

    rows.forEach((r) => {
      const date = r.created_at.split("T")[0];

      const baseAmount = r.transaction_amount;

      const grossFee = r.agent_fee + r.platform_fee;
      const qrisFee = baseAmount * qrisFeeRate;

      const agentRate =
        r.agent_commission_fee && r.agent_commission_fee > 0
          ? r.agent_commission_fee
          : agentCommissionRate;

      const agentCommissionFee = baseAmount * agentRate;
      const platformFee = r.platform_fee;

      const cleanFee = Math.max(
        grossFee - qrisFee - agentCommissionFee - platformFee,
        0,
      );

      const partnerEarning = cleanFee * partnerShare;

      dailyMap.set(date, (dailyMap.get(date) || 0) + partnerEarning);
    });

    const labels = Array.from(dailyMap.keys()).sort();
    const data = labels.map((l) => dailyMap.get(l) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Partner Earnings",
          data,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
      ],
    };
  }, [rows, partnerShare, qrisFeeRate, agentCommissionRate]);

  const options = useMemo(() => {
    const hasData =
      chartData.datasets[0].data.length > 0 &&
      chartData.datasets[0].data.some((val) => val > 0);

    const yAxisConfig = hasData
      ? {
          beginAtZero: true,
          grid: {
            borderDash: [3, 3],
            color: "#e5e7eb",
          },
          ticks: {
            color: "#64748b",
            callback: (value: any) => formatYAxisLabel(Number(value)),
          },
        }
      : {
          beginAtZero: true,
          min: 0,
          max: 10_000_000,
          grid: {
            borderDash: [3, 3],
            color: "#e5e7eb",
          },
          ticks: {
            color: "#64748b",
            stepSize: 1_000_000,
            callback: (value: any) => formatYAxisLabel(Number(value)),
          },
        };

    return {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index" as const,
        intersect: false,
      },

      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          displayColors: false,
          callbacks: {
            title: (items: any[]) => {
              return `Date: ${items[0].label}`;
            },
            label: (ctx: any) => {
              return `Partner Earnings: ${formatCurrency(ctx.parsed.y)}`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 10,
            color: "#64748b",
          },
        },
        y: yAxisConfig,
      },
    };
  }, [chartData]);

  return (
    <div className="h-80 w-full">
      <Chart type="line" data={chartData} options={options} />
    </div>
  );
};
