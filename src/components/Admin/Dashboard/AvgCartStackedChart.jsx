// src/components/admin/dashboard/AvgCartStackedChart.jsx
import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Color palette by category (indigo → violet → blue → cyan)
const CATEGORY_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.85)',  border: 'rgba(99, 102, 241, 1)'  }, // indigo
  { bg: 'rgba(139, 92, 246, 0.85)',  border: 'rgba(139, 92, 246, 1)'  }, // violet
  { bg: 'rgba(59, 130, 246, 0.85)',  border: 'rgba(59, 130, 246, 1)'  }, // blue
  { bg: 'rgba(6, 182, 212, 0.85)',   border: 'rgba(6, 182, 212, 1)'   }, // cyan
  { bg: 'rgba(168, 85, 247, 0.85)',  border: 'rgba(168, 85, 247, 1)'  }, // purple
];

/**
 * AvgCartStackedChart — Stacked bar chart for average carts by category
 *
 * Props:
 *   data {Object} – Structure:
 *     {
 *       labels: ['Mon 12', 'Tue 13', ...],      // X axis
 *       categories: ['EDR', 'XDR', 'SOC'],      // legend
 *       datasets: [                              // one entry per category
 *         [120, 95, 110, ...],                  // EDR values
 *         [80, 70, 90, ...],                    // XDR values
 *         ...
 *       ]
 *     }
 *   loading {boolean}
 */
export default function AvgCartStackedChart({ data = null, loading = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!canvasRef.current || loading || !data) return;

    if (chartRef.current) chartRef.current.destroy();

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(156,163,175,1)' : 'rgba(107,114,128,1)';

    const datasets = (data.categories ?? []).map((cat, i) => {
      const colors = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
      return {
        label: cat,
        data: data.datasets?.[i] ?? [],
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 0,
        borderRadius: i === (data.categories.length - 1) ? 8 : 0, // arrondi sur le dernier
        borderSkipped: false,
        hoverBackgroundColor: colors.border,
      };
    });

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels: data.labels ?? [], datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              font: { size: 11 },
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 4,
              useBorderRadius: true,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f9fafb' : '#111827',
            bodyColor: isDark ? '#d1d5db' : '#374151',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            callbacks: {
              label: (ctx) =>
                `  ${ctx.dataset.label} : ${ctx.raw.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })} €`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11 } },
            border: { display: false },
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (v) => `${v} €`,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, loading, isDark]);

  if (loading) {
    return <div className="w-full h-[320px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />;
  }

  if (!data || !data.labels?.length) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">
      <canvas ref={canvasRef} />
    </div>
  );
}
