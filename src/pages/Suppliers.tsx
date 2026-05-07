import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { motion } from 'framer-motion';
import { Star, BrainCircuit, MapPin, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Suppliers() {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: api.getSuppliers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Suppliers</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          {suppliers.filter((s) => s.isAiRecommended).length} AI-recommended suppliers
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Item Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Contract Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Lead Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                : suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 dark:bg-secondary/20 text-secondary text-xs font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-text-light dark:text-text-dark">{s.name}</p>
                              {s.isAiRecommended && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary/10 dark:bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                                  <BrainCircuit className="h-2.5 w-2.5" /> AI Pick
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-light dark:text-muted-dark">
                              <MapPin className="h-3 w-3" /> {s.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-light dark:text-muted-dark">{s.item}</td>
                      <td className="px-4 py-3 text-sm font-medium text-text-light dark:text-text-dark">${s.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {s.contractPrice ? (
                          <div>
                            <span className="text-sm font-semibold text-primary">${s.contractPrice.toFixed(2)}</span>
                            <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                              Save {Math.round(((s.price - s.contractPrice) / s.price) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-light dark:text-muted-dark">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">{s.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-muted-light dark:text-muted-dark">
                          <Clock className="h-3.5 w-3.5" />
                          {s.leadTimeDays} day{s.leadTimeDays > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Shield className={cn('h-3.5 w-3.5', s.reliability >= 95 ? 'text-emerald-500' : s.reliability >= 90 ? 'text-amber-500' : 'text-red-500')} />
                          <span className="text-sm text-muted-light dark:text-muted-dark">{s.reliability}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
