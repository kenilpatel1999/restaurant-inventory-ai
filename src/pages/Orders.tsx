import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShoppingCart, BrainCircuit, Truck, Clock, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import type { Order } from '@/types';

const statusConfig: Record<Order['status'], { icon: React.ReactNode; color: string; label: string }> = {
  scheduled: { icon: <CalendarClock className="h-3.5 w-3.5" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', label: 'Scheduled' },
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', label: 'Pending' },
  confirmed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', label: 'Confirmed' },
  delivered: { icon: <Truck className="h-3.5 w-3.5" />, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700', label: 'Delivered' },
  cancelled: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', label: 'Cancelled' },
};

export function Orders() {
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: api.getOrders,
  });

  const upcoming = orders.filter((o) => o.status === 'scheduled' || o.status === 'pending' || o.status === 'confirmed');
  const past = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const renderOrderCard = (order: Order, i: number) => {
    const cfg = statusConfig[order.status];
    return (
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-text-light dark:text-text-dark">{order.id}</span>
              {order.isAiScheduled && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                  <BrainCircuit className="h-2.5 w-2.5" /> AI Scheduled
                </span>
              )}
              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p className="text-sm font-medium text-text-light dark:text-text-dark">{order.supplier}</p>
            <div className="flex flex-wrap gap-1.5">
              {order.items.map((item, j) => (
                <span key={j} className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-muted-light dark:text-muted-dark">
                  {item.name} × {item.quantity}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right space-y-1 shrink-0">
            <p className="text-lg font-bold text-text-light dark:text-text-dark">${order.total.toFixed(2)}</p>
            <div className="text-xs text-muted-light dark:text-muted-dark space-y-0.5">
              <p>Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p>Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            {(order.status === 'scheduled' || order.status === 'pending') && (
              <button className="mt-2 rounded-lg border border-border-light dark:border-border-dark px-3 py-1 text-xs font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Override
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Orders</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          {upcoming.length} upcoming &middot; {orders.filter((o) => o.isAiScheduled).length} AI-scheduled
        </p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Upcoming & Active Orders
          </h2>
          <div className="space-y-3">
            {upcoming.map((o, i) => renderOrderCard(o, i))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-light dark:text-muted-dark" /> Past Orders
          </h2>
          <div className="space-y-3">
            {past.map((o, i) => renderOrderCard(o, i))}
          </div>
        </div>
      )}
    </div>
  );
}
