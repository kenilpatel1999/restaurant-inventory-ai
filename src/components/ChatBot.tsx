import { Bot, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkflowUI } from './WorkflowUI';

interface ChatBotProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function ChatBot({ open, onClose, isMobile }: ChatBotProps) {
  const panelContent = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMobile && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-800 text-slate-400"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-800 text-slate-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <WorkflowUI />
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-slate-900"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-0 h-screen border-l border-slate-700 bg-slate-900 overflow-hidden"
          style={{ zIndex: 30 }}
        >
          {panelContent}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
