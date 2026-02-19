// src/components/admin/reports/RevenueByPeriodChart.jsx
import { useEffect, useRef } from 'react';
import {
  Chart, BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js';

Chart.register(
  BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
);

/**
 * RevenueByPeriodChart — Mixed bar (revenue) + line (orders) chart
 *
 * Props :
 *   data    {Array} – [{ label, revenue, orders }, ...]
 *   loading {boolean}
 */
export default function RevenueByPeriodChart({ data = [], loading = false }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const isDark    = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx       = canvasRef.current.getContext('2d');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(156,163,175,1)'    : 'rgba(107,114,128,1)';

    // Gradient pour les barres
    const barGrad = ctx.createLinearGradient(0, 0, 0, 340);
    barGrad.addColorStop(0, 'rgba(99, 102, 241, 0.85)');
    barGrad.addColorStop(1, 'rgba(139, 92, 246, 0.50)');

    // Gradient fill sous la ligne
    const lineGrad = ctx.createLinearGradient(0, 0, 0, 340);
    lineGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
    lineGrad.addColorStop(1, 'rgba(6, 182, 212, 0.00)');

    chartRef.current = new Chart(ctx, {
      data: {
        labels:   data.map((d) => d.label),
        datasets: [
          {
            type:            'bar',
            label:           'Revenue (€)',
            data:            data.map((d) => d.revenue),
            backgroundColor: barGrad,
            borderRadius:    8,
            borderSkipped:   false,
            yAxisID:         'yRevenue',
            order:           2,
          },
          {
            type:            'line',
            label:           'Orders',
            data:            data.map((d) => d.orders),
            borderColor:     'rgba(6, 182, 212, 1)',
            backgroundColor: lineGrad,
            borderWidth:     2.5,
            pointRadius:     4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(6, 182, 212, 1)',
            pointBorderColor: isDark ? '#1f2937' : '#ffffff',
            pointBorderWidth: 2,
            tension:         0.4,
            fill:            true,
            yAxisID:         'yOrders',
            order:           1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color:         textColor,
              font:          { size: 11 },
              boxWidth:      10,
              boxHeight:     10,
              borderRadius:  3,
              useBorderRadius: true,
              padding:       16,
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor:      isDark ? '#f9fafb' : '#111827',
            bodyColor:       isDark ? '#d1d5db' : '#374151',
            borderColor:     isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            cornerRadius: 12,
            padding:      12,
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.label === 'Revenue (€)') {
                  return `  Revenue : ${ctx.raw.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;
                }
                return `  Orders : ${ctx.raw}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid:   { display: false },
            ticks:  { color: textColor, font: { size: 11 } },
            border: { display: false },
          },
          yRevenue: {
            position: 'left',
            grid:   { color: gridColor },
            ticks: {
              color: textColor,
              font:  { size: 11 },
              callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`,
            },
            border: { display: false },
          },
          yOrders: {
            position: 'right',
            grid:     { display: false },
            ticks: {
              color: 'rgba(6, 182, 212, 0.7)',
              font:  { size: 11 },
            },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, loading, isDark]);

  if (loading) return <div className="w-full h-[320px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />;
  if (!data.length) return (
    <div className="w-full h-[320px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
      No data for this period
    </div>
  );

  return <div className="w-full h-[320px]"><canvas ref={canvasRef} /></div>;
}
