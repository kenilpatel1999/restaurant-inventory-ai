import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, Minimize2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessageBubble } from './ChatMessage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import type { ChatMessage } from '@/types';

interface ChatBotProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

type FontSize = 'sm' | 'base' | 'lg';
const FONT_SIZES: FontSize[] = ['sm', 'base', 'lg'];
const FONT_LABELS: Record<FontSize, string> = { sm: 'A', base: 'A+', lg: 'A++' };

export function ChatBot({ open, onClose, isMobile }: ChatBotProps) {
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);

  const cycleFont = () => {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      return FONT_SIZES[(idx + 1) % FONT_SIZES.length];
    });
  };
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

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: (response) => {
      setExtraMessages((prev) => [...prev, response]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setExtraMessages((prev) => [...prev, userMessage]);
    sendMutation.mutate(input.trim());
    setInput('');
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

    const message = actionMessages[action] || action;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setExtraMessages((prev) => [...prev, userMessage]);
    sendMutation.mutate(message);
  };

  const panelContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-light dark:text-text-dark">AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-light dark:text-muted-dark">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={cycleFont}
            title="Change font size"
            className="flex h-7 items-center justify-center gap-1 rounded-md px-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark"
          >
            <Type className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold">{FONT_LABELS[fontSize]}</span>
          </button>
          {!isMobile && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} onAction={handleAction} fontSize={fontSize} />
        ))}
        {sendMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-light dark:text-muted-dark"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="border-t border-border-light dark:border-border-dark p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3.5 py-2.5">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about inventory, suppliers..."
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-light dark:placeholder:text-muted-dark text-text-light dark:text-text-dark"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition-colors shrink-0',
              input.trim()
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-100 dark:bg-gray-800 text-muted-light dark:text-muted-dark'
            )}
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 top-12 z-50 bg-card-light dark:bg-card-dark rounded-t-2xl"
            >
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-0 z-30 h-screen border-l border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
