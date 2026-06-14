import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { cn } from '@/lib/utils';
import { X, Plus, Trash2, Calendar, CalendarClock, Minus } from 'lucide-react';
import type { Order } from '@/types';
import { useState } from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { PastOrderComponent, CurrentOrderComponent, FutureOrderComponent } from '@/components/orders/OrderComponents';
import staticOrders from '@/data/orders.json';

// Config variable for days threshold
const CANCELLATION_DAYS_THRESHOLD = 3;

export function Orders() {
  const { data: apiOrders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: api.getOrders,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: today,
    to: today,
  });
  const [appliedDateRange, setAppliedDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: today,
    to: today,
  });

  // Use static data when date range is applied, otherwise use API data
  const orders = (appliedDateRange.from && appliedDateRange.to) ? (staticOrders as Order[]) : apiOrders;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelConfirmStep, setCancelConfirmStep] = useState(false);
  const [modifiedItems, setModifiedItems] = useState<{ name: string; quantity: number; unitPrice: number }[]>([]);

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    if (!appliedDateRange.from && !appliedDateRange.to) return true;
    const expectedDeliveryDate = new Date(order.expectedDeliveryDate);
    const expectedDeliveryDateUTC = new Date(Date.UTC(expectedDeliveryDate.getUTCFullYear(), expectedDeliveryDate.getUTCMonth(), expectedDeliveryDate.getUTCDate()));
    const expectedDeliveryDateKey = format(expectedDeliveryDateUTC, 'yyyy-MM-dd');
    const fromDateKey = appliedDateRange.from ? format(appliedDateRange.from, 'yyyy-MM-dd') : '';
    const toDateKey = appliedDateRange.to ? format(appliedDateRange.to, 'yyyy-MM-dd') : '';
    const todayKey = format(today, 'yyyy-MM-dd');

    if (expectedDeliveryDateKey >= fromDateKey && expectedDeliveryDateKey <= toDateKey) {
      // For past dates, show all orders
      // For today and future dates, show only non-delivered and non-cancelled orders
      if (expectedDeliveryDateKey >= todayKey) {
        if (order.status === 'delivered' || order.status === 'cancelled') return false;
      }
      return true;
    }
    return false;
  });

  // Group orders by date
  const ordersByDate = filteredOrders.reduce((acc, order) => {
    const expectedDeliveryDate = new Date(order.expectedDeliveryDate);
    const expectedDeliveryDateUTC = new Date(Date.UTC(expectedDeliveryDate.getUTCFullYear(), expectedDeliveryDate.getUTCMonth(), expectedDeliveryDate.getUTCDate()));
    const dateKey = format(expectedDeliveryDateUTC, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(ordersByDate).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateANormalized = new Date(dateA);
    dateANormalized.setHours(0, 0, 0, 0);
    const dateBNormalized = new Date(dateB);
    dateBNormalized.setHours(0, 0, 0, 0);

    const isAToday = dateANormalized.getTime() === today.getTime();
    const isBToday = dateBNormalized.getTime() === today.getTime();

    if (isAToday && !isBToday) return -1;
    if (!isAToday && isBToday) return 1;

    return dateA.getTime() - dateB.getTime();
  });

  // Check if order can be cancelled/modified (expected delivery is after threshold)
  const isWithinCancellationWindow = (order: Order) => {
    const expectedDeliveryDate = new Date(order.expectedDeliveryDate);
    const deliveryDateUTC = new Date(Date.UTC(expectedDeliveryDate.getUTCFullYear(), expectedDeliveryDate.getUTCMonth(), expectedDeliveryDate.getUTCDate()));

    const cutoffDate = addDays(new Date(), CANCELLATION_DAYS_THRESHOLD);
    const cutoffDateUTC = new Date(Date.UTC(cutoffDate.getUTCFullYear(), cutoffDate.getUTCMonth(), cutoffDate.getUTCDate()));
    const deliveryDateKey = format(deliveryDateUTC, 'yyyy-MM-dd');
    const cutoffKey = format(cutoffDateUTC, 'yyyy-MM-dd');
    return deliveryDateKey > cutoffKey;
  };

  // Check if order is in warning zone (after today but within threshold days)
  const isInWarningZone = (order: Order) => {
    const expectedDeliveryDate = new Date(order.expectedDeliveryDate);
    const deliveryDateUTC = new Date(Date.UTC(expectedDeliveryDate.getUTCFullYear(), expectedDeliveryDate.getUTCMonth(), expectedDeliveryDate.getUTCDate()));
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const cutoffDate = addDays(todayUTC, CANCELLATION_DAYS_THRESHOLD);
    const deliveryDateKey = format(deliveryDateUTC, 'yyyy-MM-dd');
    const todayKey = format(todayUTC, 'yyyy-MM-dd');
    const cutoffKey = format(cutoffDate, 'yyyy-MM-dd');
    return deliveryDateKey > todayKey && deliveryDateKey <= cutoffKey;
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelConfirmStep(false);
    setCancelMessage('');
    setCancelDialogOpen(true);
  };

  const handleModifyOrder = (order: Order) => {
    setSelectedOrder(order);
    setModifiedItems([...order.items]);
    setModifyDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setCancelConfirmStep(true);
  };

  const handleCancelSubmit = () => {
    // TODO: Implement API call to cancel order with message
    console.log('Cancelling order:', selectedOrder?.id, 'with message:', cancelMessage);
    setCancelDialogOpen(false);
    setCancelConfirmStep(false);
    setCancelMessage('');
    setSelectedOrder(null);
  };

  const handleModifySubmit = () => {
    // TODO: Implement API call to modify order
    console.log('Modifying order:', selectedOrder?.id, 'with items:', modifiedItems);
    setModifyDialogOpen(false);
    setModifiedItems([]);
    setSelectedOrder(null);
  };

  const handleItemQuantityChange = (index: number, newQuantity: number) => {
    setModifiedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, newQuantity) };
      return updated;
    });
  };

  const handleDeleteItem = (index: number) => {
    setModifiedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const renderOrderComponent = (order: Order, index: number, dateKey: string) => {
    const isExpanded = expandedOrders.has(order.id);
    const canModify = isWithinCancellationWindow(order);
    const inWarningZone = isInWarningZone(order);
    const expectedDeliveryDateKey = format(new Date(order.expectedDeliveryDate), 'yyyy-MM-dd');
    const todayKey = format(today, 'yyyy-MM-dd');

    if (expectedDeliveryDateKey < todayKey) {
      return (
        <PastOrderComponent
          key={order.id}
          order={order}
          isExpanded={isExpanded}
          onToggle={() => toggleOrderExpansion(order.id)}
          index={index}
        />
      );
    } else if (expectedDeliveryDateKey === todayKey) {
      return (
        <CurrentOrderComponent
          key={order.id}
          order={order}
          isExpanded={isExpanded}
          onToggle={() => toggleOrderExpansion(order.id)}
          index={index}
        />
      );
    } else {
      return (
        <FutureOrderComponent
          key={order.id}
          order={order}
          isExpanded={isExpanded}
          onToggle={() => toggleOrderExpansion(order.id)}
          index={index}
          canModify={canModify}
          inWarningZone={inWarningZone}
          onCancel={() => handleCancelOrder(order)}
          onModify={() => handleModifyOrder(order)}
          CANCELLATION_DAYS_THRESHOLD={CANCELLATION_DAYS_THRESHOLD}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        .rdp-range .rdp-day:not(.rdp-day_disabled):not(.rdp-day_selected):hover {
          background-color: var(--gray-100);
        }
        .rdp-range .rdp-day_selected {
          background-color: var(--primary);
          color: white;
        }
        .rdp-range .rdp-day_range_start {
          border-top-left-radius: 9999px;
          border-bottom-left-radius: 9999px;
        }
        .rdp-range .rdp-day_range_end {
          border-top-right-radius: 9999px;
          border-bottom-right-radius: 9999px;
        }
        .rdp-range .rdp-day_in_range {
          background-color: var(--primary) / 0.2;
        }
      `}</style>
      {/* Header with Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Order Management</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
            Orders displayed by expected delivery date
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            {filteredOrders.length} orders &middot; {orders.filter((o) => o.isAiScheduled).length} AI-scheduled
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <p className="text-xs text-muted-light dark:text-muted-dark mb-1">Select delivery dates</p>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200",
              "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark",
              "hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-text-light dark:text-text-dark">
              {appliedDateRange.from && appliedDateRange.to
                ? `${format(appliedDateRange.from, 'MMM dd')} - ${format(appliedDateRange.to, 'MMM dd, yyyy')}`
                : appliedDateRange.from
                  ? format(appliedDateRange.from, 'MMM dd, yyyy')
                  : 'Today'}
            </span>
            {(appliedDateRange.from || appliedDateRange.to) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setDateRange({ from: today, to: today });
                  setAppliedDateRange({ from: today, to: today });
                }}
                className="ml-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3 text-muted-light dark:text-muted-dark" />
              </span>
            )}
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 z-50">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onApply={() => {
                  if (dateRange.from && dateRange.to) {
                    setAppliedDateRange({ from: dateRange.from, to: dateRange.to });
                    setShowDatePicker(false);
                  }
                }}
                onClear={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setDateRange({ from: today, to: today });
                  setAppliedDateRange({ from: today, to: today });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Orders grouped by date */}
      {sortedDates.length > 0 ? (
        sortedDates.map((dateKey) => {
          const [year, month, day] = dateKey.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div key={dateKey} className={isToday ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 -mx-4 px-4 py-4 rounded-lg border border-blue-200 dark:border-blue-800" : ""}>
              <h2 className={cn(
                "text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2",
                isToday ? "text-blue-700 dark:text-blue-300" : "text-text-light dark:text-text-dark"
              )}>
                <CalendarClock className={cn("h-4 w-4", isToday ? "text-blue-600 dark:text-blue-400" : "text-primary")} />
                {format(date, 'EEE, MMM dd, yyyy')}
                {isToday && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Today</span>}
              </h2>
              <div className="space-y-3">
                {ordersByDate[dateKey].map((order, i) => renderOrderComponent(order, i, dateKey))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-light dark:text-muted-dark">
          No orders found for the selected date range.
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          {!cancelConfirmStep ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Are you sure you want to cancel order <span className="font-semibold text-text-light dark:text-text-dark">{selectedOrder?.id}</span> from <span className="font-semibold text-text-light dark:text-text-dark">{selectedOrder?.supplier}</span>?
              </p>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setCancelDialogOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel Order
                </button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Please enter a message to send to the supplier explaining why you are cancelling this order:
              </p>
              <textarea
                value={cancelMessage}
                onChange={(e) => setCancelMessage(e.target.value)}
                placeholder="Enter your cancellation reason..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setCancelConfirmStep(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={!cancelMessage.trim()}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Cancellation
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modify Order Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modify Order - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Supplier: <span className="font-semibold text-text-light dark:text-text-dark">{selectedOrder?.supplier}</span>
            </p>

            <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {modifiedItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{item.name}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">${item.unitPrice.toFixed(2)} per unit</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {modifiedItems.length === 0 && (
                <p className="text-center text-sm text-muted-light dark:text-muted-dark py-4">
                  No items in this order
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-border-light dark:border-border-dark">
              <div>
                <p className="text-sm text-muted-light dark:text-muted-dark">Total</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">
                  ${modifiedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <button
                onClick={() => setModifyDialogOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModifySubmit}
                disabled={modifiedItems.length === 0}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
