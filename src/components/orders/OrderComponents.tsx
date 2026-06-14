import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrainCircuit, Truck, Clock, CheckCircle2, XCircle, CalendarClock, ChevronDown, ChevronUp, Minus, Plus, Trash2 } from 'lucide-react';
import type { Order } from '@/types';
import { format } from 'date-fns';

const statusConfig: Record<Order['status'], { icon: React.ReactNode; color: string; label: string }> = {
  scheduled: { icon: <CalendarClock className="h-3.5 w-3.5" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', label: 'Scheduled' },
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', label: 'Pending' },
  confirmed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', label: 'Confirmed' },
  delivered: { icon: <Truck className="h-3.5 w-3.5" />, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700', label: 'Delivered' },
  cancelled: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', label: 'Cancelled' },
};

interface OrderComponentProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function PastOrderComponent({ order, isExpanded, onToggle, index }: OrderComponentProps) {
  const cfg = statusConfig[order.status];

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-mono font-semibold text-text-light dark:text-text-dark">{order.id}</span>
          {order.isAiScheduled && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              <BrainCircuit className="h-2.5 w-2.5" /> AI Scheduled
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="text-xs sm:text-sm font-medium text-text-light dark:text-text-dark truncate mr-2">{order.supplier}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" />}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border-light dark:border-border-dark p-4 space-y-4"
        >
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((item, j) => (
              <span key={j} className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-muted-light dark:text-muted-dark">
                {item.name} × {item.quantity}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-muted-light dark:text-muted-dark space-y-0.5">
              <p>Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p>Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              {order.actualDeliveryDate && (
                <p>Actual Delivery: {new Date(order.actualDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              )}
              <p className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark mt-1">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function CurrentOrderComponent({ order, isExpanded, onToggle, index }: OrderComponentProps) {
  const cfg = statusConfig[order.status];

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-mono font-semibold text-text-light dark:text-text-dark">{order.id}</span>
          {order.isAiScheduled && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              <BrainCircuit className="h-2.5 w-2.5" /> AI Scheduled
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="text-xs sm:text-sm font-medium text-text-light dark:text-text-dark truncate mr-2">{order.supplier}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" />}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border-light dark:border-border-dark p-4 space-y-4"
        >
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((item, j) => (
              <span key={j} className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-muted-light dark:text-muted-dark">
                {item.name} × {item.quantity}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-muted-light dark:text-muted-dark space-y-0.5">
              <p>Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p>Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark mt-1">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface FutureOrderComponentProps extends OrderComponentProps {
  canModify: boolean;
  inWarningZone: boolean;
  onCancel: () => void;
  onModify: () => void;
  CANCELLATION_DAYS_THRESHOLD: number;
}

export function FutureOrderComponent({ order, isExpanded, onToggle, index, canModify, inWarningZone, onCancel, onModify, CANCELLATION_DAYS_THRESHOLD }: FutureOrderComponentProps) {
  const cfg = statusConfig[order.status];

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-mono font-semibold text-text-light dark:text-text-dark">{order.id}</span>
          {order.isAiScheduled && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              <BrainCircuit className="h-2.5 w-2.5" /> AI Scheduled
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="text-xs sm:text-sm font-medium text-text-light dark:text-text-dark truncate mr-2">{order.supplier}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-light dark:text-muted-dark shrink-0" />}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border-light dark:border-border-dark p-4 space-y-4"
        >
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((item, j) => (
              <span key={j} className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-muted-light dark:text-muted-dark">
                {item.name} × {item.quantity}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-muted-light dark:text-muted-dark space-y-0.5">
              <p>Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p>Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p className="text-base sm:text-lg font-bold text-text-light dark:text-text-dark mt-1">${order.total.toFixed(2)}</p>
            </div>

            {canModify && (order.status === 'scheduled' || order.status === 'pending') && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onCancel}
                  className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Cancel Order
                </button>
                <button
                  onClick={onModify}
                  className="rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 text-xs font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Modify Order
                </button>
              </div>
            )}

            {inWarningZone && (order.status === 'scheduled' || order.status === 'pending') && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Order cannot be edited (delivery within {CANCELLATION_DAYS_THRESHOLD} days)
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
