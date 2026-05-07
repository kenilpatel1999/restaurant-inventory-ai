import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';

type FontSize = 'sm' | 'base' | 'lg';

const textSize: Record<FontSize, string> = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' };
const subTextSize: Record<FontSize, string> = { sm: 'text-xs', base: 'text-sm', lg: 'text-base' };
const microText: Record<FontSize, string> = { sm: 'text-[10px]', base: 'text-xs', lg: 'text-sm' };
const avatarSize: Record<FontSize, string> = { sm: 'h-7 w-7', base: 'h-8 w-8', lg: 'h-10 w-10' };
const iconSize: Record<FontSize, string> = { sm: 'h-3.5 w-3.5', base: 'h-4 w-4', lg: 'h-5 w-5' };
const bubblePad: Record<FontSize, string> = { sm: 'px-3.5 py-2', base: 'px-4 py-3', lg: 'px-5 py-4' };
const rowGap: Record<FontSize, string> = { sm: 'gap-2', base: 'gap-3', lg: 'gap-3.5' };

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string) => void;
  fontSize?: FontSize;
}

export function ChatMessageBubble({ message, onAction, fontSize = 'base' }: ChatMessageProps) {
  const [tableExpanded, setTableExpanded] = useState(true);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex', rowGap[fontSize], isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'shrink-0 flex items-center justify-center rounded-full text-white mt-0.5',
          avatarSize[fontSize],
          isUser ? 'bg-secondary' : 'bg-primary'
        )}
      >
        {isUser ? <User className={iconSize[fontSize]} /> : <Bot className={iconSize[fontSize]} />}
      </div>

      <div className={cn('flex flex-col max-w-[82%] gap-1.5', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            `rounded-2xl ${bubblePad[fontSize]} ${textSize[fontSize]} leading-relaxed`,
            isUser
              ? 'bg-secondary text-white rounded-tr-md'
              : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark rounded-tl-md',
            message.type === 'alert' &&
              'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          )}
        >
          {message.type === 'alert' && (
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className={iconSize[fontSize]} />
              <span className={cn(subTextSize[fontSize], 'font-semibold uppercase tracking-wide')}>Alert</span>
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.tableData && (
          <div className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden bg-card-light dark:bg-card-dark">
            <button
              onClick={() => setTableExpanded(!tableExpanded)}
              className={cn('flex w-full items-center justify-between px-3 py-2 font-medium text-muted-light dark:text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50', subTextSize[fontSize])}
            >
              <span>Data Table</span>
              {tableExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {tableExpanded && (
              <div className="overflow-x-auto">
                <table className={cn('w-full', subTextSize[fontSize])}>
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
                  `rounded-lg px-3 py-1.5 ${subTextSize[fontSize]} font-medium transition-colors`,

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

        <p className={cn(microText[fontSize], 'text-muted-light dark:text-muted-dark px-1')}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
