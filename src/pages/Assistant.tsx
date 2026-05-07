import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { ChatMessageBubble } from '@/components/ChatMessage';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, BrainCircuit, TrendingUp, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const quickActions = [
  { label: 'Check stock levels', icon: <Package className="h-3.5 w-3.5" />, message: 'What are my current stock levels?' },
  { label: 'View predictions', icon: <TrendingUp className="h-3.5 w-3.5" />, message: 'Show me AI predictions' },
  { label: 'Cost savings', icon: <DollarSign className="h-3.5 w-3.5" />, message: 'Show me cost saving opportunities' },
  { label: 'Compare suppliers', icon: <BrainCircuit className="h-3.5 w-3.5" />, message: 'Compare suppliers for vegetables' },
];

export function Assistant() {
  const [input, setInput] = useState('');
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: initialMessages = [] } = useQuery({
    queryKey: ['chat'],
    queryFn: api.getChatMessages,
  });

  const messages = useMemo(() => [...initialMessages, ...extraMessages], [initialMessages, extraMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: (response) => {
      setExtraMessages((prev) => [...prev, response]);
    },
  });

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || sendMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setExtraMessages((prev) => [...prev, userMessage]);
    sendMutation.mutate(msg);
    if (!text) setInput('');
  };

  const handleAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      order_tomatoes: 'Order 30kg of tomatoes from Fresh Farms Co.',
      compare_suppliers: 'Compare suppliers for vegetables',
      view_trend: 'Show me usage trends for tomatoes',
      order_fresh_farms: 'Place order with Fresh Farms Co.',
      view_suppliers: 'Show all suppliers',
      approve_order: 'Approve the recommended order',
      modify_order: 'I want to modify the order quantities',
      schedule_later: 'Schedule this order for later',
      check_stock: 'What are my current stock levels?',
      view_predictions: 'Show me AI predictions',
      cost_analysis: 'Show me cost saving opportunities',
    };
    handleSend(actionMessages[action] || action);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">AI Assistant</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          Chat with your AI inventory assistant for insights and actions
        </p>
      </div>

      <div className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden flex flex-col">
        <div className="flex items-center gap-2.5 border-b border-border-light dark:border-border-dark px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 dark:bg-secondary/20 text-secondary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-light dark:text-text-dark">FreshStock AI</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-muted-light dark:text-muted-dark">Online &middot; Analyzing your inventory</span>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} onAction={handleAction} />
          ))}
          {sendMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-light dark:text-muted-dark"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-border-light dark:border-border-dark p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => handleSend(qa.message)}
                className="flex items-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark px-2.5 py-1.5 text-xs font-medium text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {qa.icon}
                {qa.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-accent shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about inventory, suppliers, predictions..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-light dark:placeholder:text-muted-dark text-text-light dark:text-text-dark"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMutation.isPending}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                input.trim()
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-100 dark:bg-gray-800 text-muted-light dark:text-muted-dark'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
