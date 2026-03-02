// src/components/admin/dashboard/SalesPieChart.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const COLORS = [
  'rgba(99, 102, 241, 0.9)',   // indigo
  'rgba(139, 92, 246, 0.9)',   // violet
  'rgba(59, 130, 246, 0.9)',   // blue
  'rgba(6, 182, 212, 0.9)',    // cyan
  'rgba(168, 85, 247, 0.9)',   // purple
];

/**
 * SalesPieChart — Doughnut chart showing sales distribution
 *
 * Props:
 *   data    {Array}   – [{ label: 'EDR', value: 4500 }, ...]
 *   loading {boolean}
 */
export default function SalesPieChart({ data = [], loading = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const isDark = document.documentElement.classList.contains('dark');

  const total = data.reduce((acc, d) => acc + d.value, 0);

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return;

    if (chartRef.current) chartRef.current.destroy();

    // const textColor = isDark ? 'rgba(156,163,175,1)' : 'rgba(107,114,128,1)';

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: COLORS.slice(0, data.length),
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: 3,
            hoverOffset: 8,
            hoverBorderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false }, // légende custom en dessous
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f9fafb' : '#111827',
            bodyColor: isDark ? '#d1d5db' : '#374151',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return `  ${ctx.raw.toLocaleString('fr-FR')} € (${pct}%)`;
              },
            },
          },
        },
        onHover: (_, elements) => {
          setActiveIndex(elements.length > 0 ? elements[0].index : null);
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, loading, isDark, total]);

  if (loading) {
    return <div className="w-full h-[280px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />;
  }

  if (!data.length) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas doughnut */}
      <div className="relative w-full h-[220px]">
        <canvas ref={canvasRef} />
        {/* Total au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Total
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {total.toLocaleString('fr-FR')} €
          </span>
        </div>
      </div>

      {/* Légende interactive custom */}
      <div className="w-full space-y-1.5">
        {data.map((item, i) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          const isActive = activeIndex === i;
          return (
            <div
              key={item.label}
              className={`
                flex items-center justify-between px-3 py-1.5 rounded-lg
                transition-all duration-150
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}
              `}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.value.toLocaleString('fr-FR')} €
                </span>
                <span className={`text-xs font-semibold w-12 text-right ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
