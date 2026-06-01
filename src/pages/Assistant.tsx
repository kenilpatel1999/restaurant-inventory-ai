import { Bot } from 'lucide-react';
import { WorkflowUI } from '@/components/WorkflowUI';

export function Assistant() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">AI Assistant</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          Manage your inventory workflow with AI-powered assistance
        </p>
      </div>

      <div className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-slate-900 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2.5 border-b border-slate-700 px-4 py-3 bg-slate-800/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">FreshStock AI</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400">Online &middot; Ready to assist</span>
            </div>
          </div>
        </div>

        <WorkflowUI />
      </div>
    </div>
  );
}
