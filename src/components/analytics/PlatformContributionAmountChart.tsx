"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  ChartOptions,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { GroupedTransactionRow } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface Props {
  rows: GroupedTransactionRow[];
}

const COLORS = [
  { border: "#2563eb", fill: "rgba(37,99,235,0.25)" }, // AMB
  { border: "#f97316", fill: "rgba(249,115,22,0.25)" }, // Arya
  { border: "#22c55e", fill: "rgba(34,197,94,0.25)" }, // DEMO
  { border: "#06b6d4", fill: "rgba(6,182,212,0.25)" }, // Others
  { border: "#8b5cf6", fill: "rgba(139,92,246,0.25)" }, // UG
];

export const PlatformContributionAmountChart = ({ rows }: Props) => {
  const { labels, datasets } = useMemo(() => {
    const dateMap = new Map<string, Map<string, number>>();
    const platformTotals = new Map<string, number>();
    const platformNames = new Map<string, string>();

    rows.forEach((r) => {
      const day = r.created_at.split("T")[0];

      platformNames.set(r.platform_id, r.platform_name);

      // per-day aggregation
      if (!dateMap.has(day)) {
        dateMap.set(day, new Map());
      }
      const dayMap = dateMap.get(day)!;
      dayMap.set(
        r.platform_id,
        (dayMap.get(r.platform_id) || 0) + r.transaction_final_amount,
      );

      // total aggregation (for ranking)
      platformTotals.set(
        r.platform_id,
        (platformTotals.get(r.platform_id) || 0) + r.transaction_final_amount,
      );
    });

    const sortedDates = Array.from(dateMap.keys()).sort();

    /* =============================
     * TOP 4 BY AMOUNT + OTHERS
     * ============================= */
    const topPlatforms = Array.from(platformTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => id);

    const datasets: any[] = [];

    // Top 4 platforms
    topPlatforms.forEach((platformId, idx) => {
      datasets.push({
        label: platformNames.get(platformId) ?? platformId,
        data: sortedDates.map((d) => dateMap.get(d)?.get(platformId) || 0),
        borderColor: COLORS[idx % COLORS.length].border,
        backgroundColor: COLORS[idx % COLORS.length].fill,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        // stack: "amount",
      });
    });

    // Others (sum of all remaining platforms)
    datasets.push({
      label: "Others",
      data: sortedDates.map((d) => {
        const dayMap = dateMap.get(d);
        if (!dayMap) return 0;

        let sum = 0;
        dayMap.forEach((amount, platformId) => {
          if (!topPlatforms.includes(platformId)) {
            sum += amount;
          }
        });
        return sum;
      }),
      borderColor: "#64748b",
      backgroundColor: "rgba(100,116,139,0.25)",
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      // stack: "amount",
    });

    return {
      labels: sortedDates,
      datasets,
    };
  }, [rows]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const y = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label}: Rp ${y.toLocaleString()}`;
          },
        },
        itemSort: (a, b) => (b.parsed.y ?? 0) - (a.parsed.y ?? 0),
      },
    },

    scales: {
      x: {
        type: "category",
        grid: {
          display: false,
        },
      },

      y: {
        type: "linear", // ✅ REQUIRED
        stacked: false,
        beginAtZero: true,

        title: {
          display: true,
          text: "Transaction Amount (Rp)",
        },

        ticks: {
          callback: (v) => `Rp ${v}`,
        },

        border: {
          dash: [4, 4], // ✅ CORRECT v4 API
        },
      },
    },
  };

  return (
    <div className="h-[360px]">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
};
