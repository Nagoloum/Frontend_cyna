// src/components/admin/dashboard/QuickActions.jsx
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, HeadphonesIcon, BarChart3, ArrowRight } from 'lucide-react';

const ACTIONS = [
  {
    label: 'Add Product',
    description: 'Create a new SaaS service',
    icon: Plus,
    to: '/admin/products?action=create',
    color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
  },
  {
    label: 'View Orders',
    description: 'Manage and track orders',
    icon: ShoppingCart,
    to: '/admin/orders',
    color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/20',
    iconBg: 'bg-violet-100 dark:bg-violet-500/20',
  },
  {
    label: 'Manage Support',
    description: 'Pending messages and tickets',
    icon: HeadphonesIcon,
    to: '/admin/support',
    color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20',
  },
  {
    label: 'Reports détaillés',
    description: 'Export CSV / PDF',
    icon: BarChart3,
    to: '/admin/reports',
    color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20',
    iconBg: 'bg-cyan-100 dark:bg-cyan-500/20',
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ACTIONS.map(({ label, description, icon: Icon, to, color, iconBg }) => (
        <button
          key={to}
          onClick={() => navigate(to)}
          className={`
            group flex flex-col items-start gap-3 p-4 rounded-2xl
            border transition-all duration-200 text-left
            ${color}
          `}
        >
          {/* Icône */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={17} />
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{label}</p>
            <p className="text-xs opacity-70 mt-0.5 leading-tight hidden sm:block">{description}</p>
          </div>

          {/* Flèche hover */}
          <ArrowRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-end"
          />
        </button>
      ))}
    </div>
  );
}
