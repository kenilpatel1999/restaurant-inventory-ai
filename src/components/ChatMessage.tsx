import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string) => void;
}

export function ChatMessageBubble({ message, onAction }: ChatMessageProps) {
  const [tableExpanded, setTableExpanded] = useState(true);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white',
          isUser ? 'bg-secondary' : 'bg-primary'
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={cn('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-secondary text-white rounded-tr-md'
              : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark rounded-tl-md',
            message.type === 'alert' &&
              'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          )}
        >
          {message.type === 'alert' && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Alert</span>
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.tableData && (
          <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden bg-card-light dark:bg-card-dark">
            <button
              onClick={() => setTableExpanded(!tableExpanded)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-light dark:text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <span>Data Table</span>
              {tableExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {tableExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
                      {message.tableData.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-semibold text-text-light dark:text-text-dark">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.tableData.rows.map((row, i) => (
                      <tr key={i} className="border-t border-border-light dark:border-border-dark">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-muted-light dark:text-muted-dark">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action.action)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  action.variant === 'primary' &&
                    'bg-primary text-white hover:bg-primary-dark',
                  action.variant === 'secondary' &&
                    'bg-secondary/10 text-secondary hover:bg-secondary/20 dark:bg-secondary/20 dark:hover:bg-secondary/30',
                  action.variant === 'outline' &&
                    'border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-light dark:text-muted-dark">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
