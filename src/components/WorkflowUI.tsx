import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, TrendingUp, Send, Sparkles } from 'lucide-react';
import { useAgent } from '@/contexts/AgentContext';
import { api } from '@/api/endpoints';
import type { OrderableItem } from './FloatingChat/types';
import type { ChatMessage } from '@/types';

const VENDORS = [
  { id: 'v1', name: 'Fresh Farms Co.', available: true },
  { id: 'v2', name: 'Quality Foods Inc.', available: true },
  { id: 'v3', name: 'Metro Suppliers', available: true },
];

export function WorkflowUI() {
  const {
    workflowState,
    setWorkflowState,
    items,
    setItems,
    orderableItems,
    setOrderableItems,
    predictiveItems,
    setPredictiveItems,
    chatMessages,
    addChatMessage,
    updateChatMessage,
    setLastUpdatedBy,
  } = useAgent();

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const MAX_RETRIES = 3;
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Cleanup AbortController on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatMarkdown = (text: string) => {
    // Replace **bold** with <strong>bold</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace * item with bullet points (handle both with and without spaces)
    formatted = formatted.replace(/^\*   /gm, '• ');
    formatted = formatted.replace(/^\* /gm, '• ');

    // Replace newlines with <br> for line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
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
      setLastUpdatedBy('assistant');
      return;
    }

    const orderable: OrderableItem[] = missingItems.map(item => ({
      ...item,
      status: 'missing',
      vendors: VENDORS,
    }));

    setOrderableItems(orderable);
    setWorkflowState('ordering');
    setLastUpdatedBy('assistant');
  };

  const handleOrder = (itemId: string, vendorId: string) => {
    const vendor = VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;

    setOrderableItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, status: 'ordered', orderedFrom: vendor.name }
        : item
    ));
    setLastUpdatedBy('assistant');
  };

  const handlePredictiveOrder = (itemId: string) => {
    setPredictiveItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ordered: true } : item
    ));
    setLastUpdatedBy('assistant');
  };

  const handleDone = () => {
    setWorkflowState('final');
    setLastUpdatedBy('assistant');
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;

    // Clear any previous error
    setError(null);

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

    // Close any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new fetch connection
    const abortController = api.streamRecommendations(
      query,
      (chunk) => {
        console.log('Received chunk:', chunk);
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

        // Remove the failed assistant message
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

    // Close any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new fetch connection
    const abortController = api.streamRecommendations(
      lastQuery,
      (chunk) => {
        console.log('Received chunk (retry):', chunk);
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

        // Remove the failed assistant message
        updateChatMessage(assistantMessageId, (msg) => ({
          ...msg,
          content: 'Failed to get response. Please try again.',
        }));
      }
    );

    abortControllerRef.current = abortController;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Greeting State */}
      {workflowState === 'greeting' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 space-y-6"
        >
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-slate-100">{getGreeting()}!</h2>
            <p className="text-base text-slate-300">
              Let's verify today's delivery. Check off items as you receive them.
            </p>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/60"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-base font-semibold text-slate-100">{item.name}</p>
                  <p className="text-sm text-slate-400">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 space-y-6"
        >
          <div className="flex items-center gap-3 text-slate-100">
            <Package className="h-6 w-6 text-amber-400" />
            <h3 className="text-xl font-bold">Missing Items</h3>
          </div>

          <div className="space-y-4">
            {orderableItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{item.name}</p>
                      <p className="text-sm text-slate-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    {item.status === 'ordered' && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Ordered
                      </span>
                    )}
                  </div>

                  {item.status === 'ordered' && item.orderedFrom && (
                    <p className="text-sm text-slate-300">From: {item.orderedFrom}</p>
                  )}

                  {item.status !== 'ordered' && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        Select Vendor
                      </p>
                      <div className="bg-slate-900/40 rounded-lg overflow-hidden border border-slate-700/40">
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
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {orderableItems.every(item => item.status === 'ordered') && (
            <button
              onClick={() => setWorkflowState('complete')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base py-3 rounded-xl transition-colors"
            >
              Continue
            </button>
          )}
        </motion.div>
      )}

      {/* Complete/Predictive States */}
      {(workflowState === 'complete' || workflowState === 'predictive') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 space-y-6"
        >
          <div className="flex items-center gap-3 text-slate-100">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold">Predictive Recommendations</h3>
          </div>

          <p className="text-sm text-slate-300">
            Based on your usage patterns and upcoming demand, I recommend ordering these items:
          </p>

          <div className="space-y-4">
            {predictiveItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/60"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-base font-semibold text-slate-100">{item.name}</p>
                    <p className="text-sm text-slate-400">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  {item.ordered ? (
                    <span className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-600/20 text-emerald-400 text-sm font-semibold">
                      ✓ Ordered
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePredictiveOrder(item.id)}
                      className="shrink-0 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                    >
                      Order
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{item.reasoning}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleDone}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold text-base py-3 rounded-xl transition-colors"
          >
            Done
          </button>
        </motion.div>
      )}

      {/* Final State - Chat Interface */}
      {workflowState === 'final' && (
        <div className="flex flex-col h-full">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Completion Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Workflow Complete!</h3>
              <p className="text-base text-slate-300 text-center mb-4">
                Your inventory has been updated and orders have been placed.
              </p>
              <p className="text-sm text-slate-400">
                Ask me anything about your inventory, suppliers, or predictions!
              </p>
            </motion.div>

            {/* Chat Messages */}
            {chatMessages.map((msg) => {
              // Hide empty assistant messages while streaming
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
  );
}
