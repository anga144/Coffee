import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-coffee-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-ember-600 font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ icon, title, message }: { icon?: React.ReactNode; title: string; message?: string }) {
  return (
    <div className="card p-12 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-coffee-100 flex items-center justify-center mx-auto mb-4 text-coffee-400">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-coffee-800">{title}</h3>
      {message && <p className="text-coffee-500 text-sm mt-1">{message}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-coffee-500 font-medium">{label}</p>
          <p className="text-2xl font-display font-bold text-coffee-900 mt-1">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-coffee-100 flex items-center justify-center text-coffee-600">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-forest-600' : 'text-ember-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-coffee-900">{title}</h2>
        {subtitle && <p className="text-coffee-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] overflow-hidden flex flex-col animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-coffee-100">
          <h3 className="font-display text-lg font-bold text-coffee-900">{title}</h3>
          <button onClick={onClose} className="text-coffee-400 hover:text-coffee-700 transition-colors text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-forest-100 text-forest-700',
    draft: 'bg-coffee-100 text-coffee-600',
    paused: 'bg-amber-100 text-amber-700',
    completed: 'bg-gray-200 text-gray-600',
    published: 'bg-forest-100 text-forest-700',
    scheduled: 'bg-blue-100 text-blue-700',
    approved: 'bg-forest-100 text-forest-700',
    ended: 'bg-gray-200 text-gray-600',
  };
  return <span className={`badge ${styles[status] || 'bg-coffee-100 text-coffee-600'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
