import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { motion } from 'framer-motion';
import { FileText, Check, X, Pencil, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contract } from '@/types';

const statusStyles: Record<Contract['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  modified: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
};

export function Contracts() {
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: api.getContracts,
  });

  const [localContracts, setLocalContracts] = useState<Record<string, Contract['status']>>({});

  const getStatus = (c: Contract) => localContracts[c.id] ?? c.status;

  const updateStatus = (id: string, status: Contract['status']) => {
    setLocalContracts((prev) => ({ ...prev, [id]: status }));
  };

  const totalSavings = contracts.reduce((sum, c) => {
    const s = getStatus(c);
    return s === 'accepted' || s === 'pending' ? sum + c.savings : sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Contracts</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
            AI-suggested supplier contracts &middot; Potential savings: <span className="font-semibold text-primary">${totalSavings}/period</span>
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">AI analyzed 6 months of purchasing data</span>
        </div>
      </div>

      <div className="space-y-4">
        {contracts.map((contract, i) => {
          const status = getStatus(contract);
          return (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 dark:bg-secondary/20 text-secondary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">{contract.supplier}</h3>
                      <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', statusStyles[status])}>
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-light dark:text-muted-dark">{contract.item}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-light dark:text-muted-dark">
                      <span>Qty: <strong className="text-text-light dark:text-text-dark">{contract.quantity} units</strong></span>
                      <span>Freq: <strong className="text-text-light dark:text-text-dark">{contract.frequency}</strong></span>
                      <span>{new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {new Date(contract.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-light dark:text-muted-dark">Current</p>
                    <p className="text-sm font-medium text-text-light dark:text-text-dark line-through opacity-60">${contract.currentPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-light dark:text-muted-dark">Contract</p>
                    <p className="text-sm font-bold text-primary">${contract.contractPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-light dark:text-muted-dark">Savings</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${contract.savings}/period</p>
                  </div>

                  {status === 'pending' && (
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => updateStatus(contract.id, 'accepted')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        title="Accept"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(contract.id, 'modified')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="Modify"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(contract.id, 'rejected')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
