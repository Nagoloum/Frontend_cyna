// src/components/admin/dashboard/RevenueLineChart.jsx
import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Filler,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

/**
 * Revenue line chart with gradient fill.
 *
 * Props:
 *   data    Array<{ label: string, value: number }>  (already aggregated upstream)
 *   period  string  (forces redraw on period change)
 *   loading boolean
 */
export default function RevenueLineChart({ data = [], period = '7d', loading = false }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const isDark    = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    chartRef.current?.destroy();

    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);
    const ctx = canvasRef.current.getContext('2d');

    const fill = ctx.createLinearGradient(0, 0, 0, 320);
    fill.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    fill.addColorStop(1, 'rgba(139, 92, 246, 0.02)');

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(156,163,175,1)' : 'rgba(107,114,128,1)';

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (€)',
          data: values,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: fill,
          borderWidth: 2.5,
          tension: 0.4,                 // smooth curve
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f9fafb' : '#111827',
            bodyColor: isDark ? '#d1d5db' : '#374151',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (ctx) =>
                `${Number(ctx.raw).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, period, loading, isDark]);

  if (loading) {
    return <div className="w-full h-[320px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />;
  }

  const empty = !data.length || data.every((d) => !d.value);
  if (empty) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No paid orders for this period
      </div>
    );
  }

  return <div className="w-full h-[320px]"><canvas ref={canvasRef} /></div>;
}
