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

      <WorkflowUI />
    </div>
  );
}
