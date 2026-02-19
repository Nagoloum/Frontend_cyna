// src/components/admin/dashboard/SalesBarChart.jsx
import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Enregistrement des modules Chart.js (tree-shaking friendly)
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

/**
 * SalesBarChart — Sales histogram by day/week
 *
 * Props:
 *   data    {Array}   – [{ label: 'Mon 12', value: 1450.5 }, ...]
 *   period  {string}  – '7d' | '5w' | etc. (used for axis title)
 *   loading {boolean}
 */
export default function SalesBarChart({ data = [], period = '7d', loading = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    // Détruire l'instance précédente pour éviter les leaks
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    const ctx = canvasRef.current.getContext('2d');

    // Gradient indigo pour les barres
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');   // indigo-500
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)');   // violet-500

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(156,163,175,1)' : 'rgba(107,114,128,1)';

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Sales (€)',
            data: values,
            backgroundColor: gradient,
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
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
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, period, loading, isDark]);

  if (loading) {
    return (
      <div className="w-full h-[320px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    );
  }

  if (!data.length) {
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
