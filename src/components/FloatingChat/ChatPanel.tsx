import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Bot, CheckCircle2, Package, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryItem, OrderableItem, WorkflowState, PredictiveItem } from './types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

const INITIAL_ITEMS: DeliveryItem[] = [
  { id: '1', name: 'Olives', quantity: 10, unit: 'lb', status: 'pending', checked: false },
  { id: '2', name: 'Chicken', quantity: 7, unit: 'lb', status: 'pending', checked: false },
  { id: '3', name: 'Tofu', quantity: 15, unit: 'lb', status: 'pending', checked: false },
  { id: '4', name: 'Cilantro', quantity: 3, unit: 'lb', status: 'pending', checked: false },
  { id: '5', name: 'Olive Oil', quantity: 7, unit: 'oz', status: 'pending', checked: false },
  { id: '6', name: 'Onions', quantity: 20, unit: 'lb', status: 'pending', checked: false },
];

const VENDORS = [
  { id: 'v1', name: 'Fresh Farms Co.', available: true },
  { id: 'v2', name: 'Quality Foods Inc.', available: true },
  { id: 'v3', name: 'Metro Suppliers', available: true },
];

const PREDICTIVE_ITEMS: PredictiveItem[] = [
  {
    id: 'p1',
    name: 'Onions',
    quantity: 25,
    unit: 'lb',
    ordered: false,
    reasoning: 'High usage over the past 3 days (avg 8 lb/day) with tomorrow\'s forecast showing 60% increase in orders containing onion-based dishes.',
  },
  {
    id: 'p2',
    name: 'Tomatoes',
    quantity: 18,
    unit: 'lb',
    ordered: false,
    reasoning: 'Current inventory at 15% below optimal level. Weekend forecast predicts 40% surge in salad orders and pasta dishes requiring fresh tomatoes.',
  },
  {
    id: 'p3',
    name: 'Cheese',
    quantity: 12,
    unit: 'lb',
    ordered: false,
    reasoning: 'Historical data shows cheese consumption spikes on Thursdays. Current stock will run out by Friday morning based on projected demand.',
  },
];

export function ChatPanel({ isOpen, onClose, onMinimize }: ChatPanelProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('greeting');
  const [items, setItems] = useState<DeliveryItem[]>(INITIAL_ITEMS);
  const [orderableItems, setOrderableItems] = useState<OrderableItem[]>([]);
  const [predictiveItems, setPredictiveItems] = useState<PredictiveItem[]>(PREDICTIVE_ITEMS);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [workflowState, orderableItems, predictiveItems]);

  useEffect(() => {
    if (workflowState === 'complete') {
      console.log('Starting 5-second timer for predictive state...');
      timerRef.current = window.setTimeout(() => {
        console.log('Timer complete, transitioning to predictive state');
        setWorkflowState('predictive');
      }, 5000); // Changed to 5 seconds for easier testing
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [workflowState]);

  useEffect(() => {
    if (workflowState === 'ordering' && orderableItems.length > 0) {
      const allOrdered = orderableItems.every(item => item.status === 'ordered');
      if (allOrdered) {
        console.log('All items ordered, transitioning to complete state');
        setTimeout(() => {
          setWorkflowState('complete');
        }, 1000);
      }
    }
  }, [orderableItems, workflowState]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCheckboxChange = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSubmit = () => {
    const missingItems = items.filter(item => !item.checked);

    if (missingItems.length === 0) {
      setWorkflowState('complete');
      return;
    }

    const orderable: OrderableItem[] = missingItems.map(item => ({
      ...item,
      status: 'missing',
      vendors: VENDORS,
    }));

    setOrderableItems(orderable);
    setWorkflowState('ordering');
  };

  const handleOrder = (itemId: string, vendorId: string) => {
    const vendor = VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;

    setOrderableItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, status: 'ordered', orderedFrom: vendor.name }
        : item
    ));
  };

  const handlePredictiveOrder = (itemId: string) => {
    setPredictiveItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ordered: true } : item
    ));
  };

  const handleDone = () => {
    setWorkflowState('final');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-[420px] z-40 h-[680px] max-h-[88vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-slate-900 border border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-700 px-4 py-3.5 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">AI Inventory Agent</h3>
                <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onMinimize && (
                <button onClick={onMinimize} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors" aria-label="Minimize">
                  <Minimize2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-4 bg-slate-900">
            {/* Greeting State */}
            {workflowState === 'greeting' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 pt-4 pb-3">
                  <p className="text-white font-bold text-base mb-1">{getGreeting()}, Manager</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    The delivery from the vendor is supposed to have arrived. Can you confirm the following items?
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {items.map((item, idx) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700 transition-colors ${idx < items.length - 1 ? 'border-b border-slate-700' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked || false}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="h-5 w-5 rounded accent-emerald-500 cursor-pointer shrink-0"
                      />
                      <span className="text-base text-slate-100">
                        {item.quantity} {item.unit} {item.name}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-base py-3 rounded-xl transition-colors"
                >
                  Submit
                </button>
              </motion.div>
            )}

            {/* Ordering State */}
            {workflowState === 'ordering' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-white font-bold text-base px-1">You can order the following missing items:</p>
                {orderableItems.map((item) => (
                  <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                      <div>
                        <p className="text-white font-bold text-base">{item.name}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{item.quantity} {item.unit}</p>
                      </div>
                      {item.status === 'ordered' && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-semibold">Ordered</span>
                        </div>
                      )}
                    </div>
                    {item.status === 'ordered' ? (
                      <div className="px-4 py-3 bg-emerald-900/30 flex items-center gap-2 text-emerald-400 text-sm">
                        <Package className="h-4 w-4 shrink-0" />
                        Ordered from <strong>{item.orderedFrom}</strong>
                      </div>
                    ) : (
                      <div>
                        <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">Select Supplier</p>
                        {item.vendors.map((vendor, vIdx) => (
                          <button
                            key={vendor.id}
                            onClick={() => handleOrder(item.id, vendor.id)}
                            className={`w-full text-left px-4 py-3 text-base text-slate-200 hover:bg-slate-700 hover:text-white transition-colors ${vIdx < item.vendors.length - 1 ? 'border-b border-slate-700/60' : ''}`}
                          >
                            {vendor.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Complete State */}
            {workflowState === 'complete' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">All Items Verified!</h4>
                <p className="text-slate-400 text-base">All delivery items confirmed. No missing items to order.</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm text-slate-400">Analyzing forecast data...</p>
                  </div>
                  <button onClick={() => setWorkflowState('predictive')} className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold underline">
                    Continue now
                  </button>
                </div>
              </motion.div>
            )}

            {/* Predictive Ordering State */}
            {workflowState === 'predictive' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base mb-1">Predictive Inventory Recommendation</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Based on tomorrow's forecast and today's usage, order these items to stay stocked:
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {predictiveItems.map((item, idx) => (
                    <div key={item.id} className={idx < predictiveItems.length - 1 ? 'border-b border-slate-700' : ''}>
                      <div className="px-4 py-4">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-white font-bold text-base">{item.name}</span>
                          {item.ordered ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-semibold">Ordered</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePredictiveOrder(item.id)}
                              className="shrink-0 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                            >
                              Order
                            </button>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{item.quantity} {item.unit}</p>
                        <div className="flex items-start gap-2">
                          <span className="text-base leading-none mt-0.5">🤖</span>
                          <p className="text-slate-400 text-sm leading-relaxed">{item.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDone}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors text-base"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* Final State */}
            {workflowState === 'final' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{getGreeting()}</h4>
                <p className="text-slate-400 text-base">All tasks completed successfully.</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 bg-slate-800 px-5 py-3 shrink-0">
            <p className="text-xs text-center text-slate-500">Powered by FreshStock AI</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
