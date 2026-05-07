import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { StatusBadge } from '@/components/StatusBadge';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InventoryItem, InventoryStatus } from '@/types';

type SortKey = keyof InventoryItem;
type SortDir = 'asc' | 'desc';

const statusPriority: Record<InventoryStatus, number> = { critical: 0, low: 1, healthy: 2 };

function SortableHeader({ label, dataKey, sortKey, onSort }: {
  label: string; dataKey: SortKey; sortKey: SortKey; onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark cursor-pointer hover:text-text-light dark:hover:text-text-dark select-none"
      onClick={() => onSort(dataKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('h-3 w-3', sortKey === dataKey && 'text-primary')} />
      </div>
    </th>
  );
}

export function Inventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: api.getInventory,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s) || i.supplier.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortKey === 'status') {
        const diff = statusPriority[a.status] - statusPriority[b.status];
        return sortDir === 'asc' ? diff : -diff;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [items, search, statusFilter, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Inventory</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
            {items.length} items tracked &middot; {items.filter((i) => i.status === 'critical').length} critical
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-3 py-2">
            <Search className="h-4 w-4 text-muted-light dark:text-muted-dark" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-light dark:placeholder:text-muted-dark text-text-light dark:text-text-dark"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-2 py-1">
            <Filter className="h-4 w-4 text-muted-light dark:text-muted-dark" />
            {(['all', 'critical', 'low', 'healthy'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize',
                  statusFilter === s
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
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
                <SortableHeader label="Item" dataKey="name" sortKey={sortKey} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Category</th>
                <SortableHeader label="Current Stock" dataKey="currentStock" sortKey={sortKey} onSort={handleSort} />
                <SortableHeader label="Daily Usage" dataKey="dailyUsage" sortKey={sortKey} onSort={handleSort} />
                <SortableHeader label="Predicted Run Out" dataKey="predictedRunOut" sortKey={sortKey} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-light dark:text-muted-dark">Suggested Order</th>
                <SortableHeader label="Status" dataKey="status" sortKey={sortKey} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="h-8 w-8 mx-auto text-muted-light dark:text-muted-dark mb-2" />
                    <p className="text-sm text-muted-light dark:text-muted-dark">No items found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-light dark:text-text-dark">{item.name}</p>
                          <p className="text-xs text-muted-light dark:text-muted-dark">{item.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-light dark:text-muted-dark">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-semibold',
                        item.status === 'critical' ? 'text-red-600 dark:text-red-400' :
                          item.status === 'low' ? 'text-amber-600 dark:text-amber-400' :
                            'text-text-light dark:text-text-dark'
                      )}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-light dark:text-muted-dark">
                      {item.dailyUsage} {item.unit}/day
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-light dark:text-muted-dark">
                      {new Date(item.predictedRunOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary">
                      {item.suggestedOrder} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
