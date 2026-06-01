import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Bot, CheckCircle2, Package, TrendingUp, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgent } from '@/contexts/AgentContext';
import { api } from '@/api/endpoints';
import type { Vendor, OrderableItem } from './types';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Fresh Farms Co.', available: true },
  { id: 'v2', name: 'Quality Foods Inc.', available: true },
  { id: 'v3', name: 'Metro Suppliers', available: true },
];

export function ChatPanel({ isOpen, onClose, onMinimize }: ChatPanelProps) {
  const {
    workflowState,
    setWorkflowState,
    items,
    setItems,
    orderableItems,
    setOrderableItems,
    predictiveItems,
    setPredictiveItems,
    setLastUpdatedBy,
    chatMessages,
    addChatMessage,
    updateChatMessage,
  } = useAgent();
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const MAX_RETRIES = 3;
  const streamingMessageIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>('');

  const scrollToBottom = () => {
    contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [workflowState, orderableItems, predictiveItems, chatMessages]);

  // Cleanup AbortController on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

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
      setLastUpdatedBy('agent');
      return;
    }

    const orderable: OrderableItem[] = missingItems.map(item => ({
      ...item,
      status: 'missing',
      vendors: VENDORS,
    }));

    setOrderableItems(orderable);
    setWorkflowState('ordering');
    setLastUpdatedBy('agent');
  };

  const handleOrder = (itemId: string, vendorId: string) => {
    const vendor = VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;

    setOrderableItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, status: 'ordered', orderedFrom: vendor.name }
        : item
    ));
    setLastUpdatedBy('agent');
  };

  const handlePredictiveOrder = (itemId: string) => {
    setPredictiveItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ordered: true } : item
    ));
    setLastUpdatedBy('agent');
  };

  const handleDone = () => {
    setWorkflowState('final');
    setLastUpdatedBy('agent');
  };

  const formatMarkdown = (text: string) => {
    // Replace @!@ with newline
    let formatted = text.replace(/@!@/g, '\n');

    // Replace **bold** with <strong>bold</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace *italic* with <em>italic</em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace `code` with <code>code</code>
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 py-0.5 rounded text-emerald-400">$1</code>');

    // Replace ```code block``` with <pre><code>
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>');

    // Replace # heading with <h1>
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-slate-100 mb-2">$1</h1>');

    // Replace ## heading with <h2>
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-slate-100 mb-2">$1</h2>');

    // Replace ### heading with <h3>
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-100 mb-2">$1</h3>');

    // Replace - item with bullet points
    formatted = formatted.replace(/^-   /gm, '• ');
    formatted = formatted.replace(/^- /gm, '• ');

    // Replace * item with bullet points (handle both with and without spaces)
    formatted = formatted.replace(/^\*   /gm, '• ');
    formatted = formatted.replace(/^\* /gm, '• ');

    // Replace > quote with blockquote
    formatted = formatted.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-slate-600 pl-4 italic text-slate-300 my-2">$1</blockquote>');

    // Replace --- with horizontal rule
    formatted = formatted.replace(/^---$/gm, '<hr class="border-slate-700 my-4"');

    // Replace [link](url) with <a>
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Replace newlines with <br> for line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    const query = input.trim();
    setInput('');
    setLastQuery(query);
    setRetryCount(0);
    addChatMessage(userMessage);
    setLastUpdatedBy('assistant');

    const assistantMessageId = Date.now().toString() + '_assistant';
    streamingMessageIdRef.current = assistantMessageId;

    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    addChatMessage(assistantMessage);
    setIsStreaming(true);
    accumulatedContentRef.current = '';

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = api.streamRecommendations(
      query,
      (chunk) => {
        accumulatedContentRef.current += chunk;
        updateChatMessage(assistantMessageId, (msg) => ({
          ...msg,
          content: accumulatedContentRef.current,
        }));
      },
      () => {
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
        abortControllerRef.current = null;
        setRetryCount(0);
      },
      (err) => {
        console.error('Streaming error:', err);
        setRetryCount(prev => prev + 1);
        if (retryCount < MAX_RETRIES) {
          setError('An error occurred. Please try again.');
        } else {
          setError('Maximum retry attempts reached. Please try again later.');
        }
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
        abortControllerRef.current = null;
        updateChatMessage(assistantMessageId, (msg) => ({
          ...msg,
          content: 'Failed to get response. Please try again.',
        }));
      }
    );

    abortControllerRef.current = abortController;
  };

  const handleRetry = () => {
    if (!lastQuery || retryCount >= MAX_RETRIES) return;

    setRetryCount(prev => prev + 1);
    setError(null);

    const assistantMessageId = Date.now().toString() + '_assistant';
    streamingMessageIdRef.current = assistantMessageId;

    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    addChatMessage(assistantMessage);
    setIsStreaming(true);
    accumulatedContentRef.current = '';

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = api.streamRecommendations(
      lastQuery,
      (chunk) => {
        accumulatedContentRef.current += chunk;
        updateChatMessage(assistantMessageId, (msg) => ({
          ...msg,
          content: accumulatedContentRef.current,
        }));
      },
      () => {
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
        abortControllerRef.current = null;
        setRetryCount(0);
      },
      (err) => {
        console.error('Streaming error:', err);
        setRetryCount(prev => prev + 1);
        if (retryCount < MAX_RETRIES) {
          setError('An error occurred. Please try again.');
        } else {
          setError('Maximum retry attempts reached. Please try again later.');
        }
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
        abortControllerRef.current = null;
        updateChatMessage(assistantMessageId, (msg) => ({
          ...msg,
          content: 'Failed to get response. Please try again.',
        }));
      }
    );

    abortControllerRef.current = abortController;
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

            {/* Final State - Chat Interface */}
            {workflowState === 'final' && (
              <div className="flex flex-col h-full">
                <div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Chat Messages */}
                  {chatMessages.map((msg) => {
                    if (msg.role === 'assistant' && !msg.content && isStreaming && msg.id === streamingMessageIdRef.current) {
                      return null;
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-100 border border-slate-700'
                            }`}
                        >
                          {msg.role === 'assistant' ? (
                            <p
                              className="text-sm"
                              dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                            />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming Indicator */}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-slate-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-900/20 border border-red-700 rounded-xl px-4 py-3 flex flex-col items-center gap-2">
                        <p className="text-sm text-red-400">{error}</p>
                        {retryCount < MAX_RETRIES && (
                          <button
                            onClick={handleRetry}
                            disabled={isStreaming}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Retry ({MAX_RETRIES - retryCount} attempts left)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-slate-700 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about inventory, suppliers, predictions..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 text-slate-100"
                        disabled={isStreaming}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${input.trim() && !isStreaming
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
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
