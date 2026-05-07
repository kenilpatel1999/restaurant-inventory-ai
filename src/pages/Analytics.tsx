import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { ChartCard } from '@/components/ChartCard';
import { DashboardCard } from '@/components/DashboardCard';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = ['#2E7D32', '#1565C0', '#F59E0B', '#DC2626', '#7C3AED', '#EC4899'];

export function Analytics() {
  const { data: usageTrends = [] } = useQuery({
    queryKey: ['usage-trends'],
    queryFn: api.getUsageTrends,
  });

  const { data: supplierCosts = [] } = useQuery({
    queryKey: ['supplier-costs'],
    queryFn: api.getSupplierCostComparison,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: api.getInventory,
  });

  const categoryBreakdown = inventory.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.currentStock * item.unitPrice;
    return acc;
  }, {});

  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  const totalInventoryValue = pieData.reduce((s, d) => s + d.value, 0);
  const totalSavings = supplierCosts.reduce((s, d) => s + (d.currentCost - d.aiSuggestedCost), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Analytics</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          Deep insights into your inventory operations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Inventory Value"
          value={`$${Math.round(totalInventoryValue).toLocaleString()}`}
          change={5.2}
          changeLabel="vs last month"
          icon={<Package className="h-5 w-5" />}
          delay={0}
        />
        <DashboardCard
          title="Weekly Usage (kg)"
          value={usageTrends.reduce((s, d) => s + d.usage, 0)}
          change={8.1}
          changeLabel="vs last week"
          icon={<BarChart3 className="h-5 w-5" />}
          delay={0.05}
        />
        <DashboardCard
          title="AI Prediction Accuracy"
          value="93.2%"
          change={1.8}
          changeLabel="improving"
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.1}
        />
        <DashboardCard
          title="Potential Monthly Savings"
          value={`$${totalSavings.toLocaleString()}`}
          change={15.3}
          changeLabel="identified"
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Inventory Value by Category" subtitle="Current stock value distribution" delay={0.2} className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Usage Pattern" subtitle="Total kg consumed per day this week" delay={0.25} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={usageTrends}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="usage" name="Usage (kg)" stroke="#2E7D32" fill="url(#analyticsGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Savings Opportunity by Supplier" subtitle="Difference between current spend and AI-optimized contracts" delay={0.3}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={supplierCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="supplier" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }} />
            <Legend />
            <Bar dataKey="currentCost" name="Current Spend" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="aiSuggestedCost" name="AI Optimized" fill="#2E7D32" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
