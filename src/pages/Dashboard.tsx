import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { DashboardCard } from '@/components/DashboardCard';
import { ChartCard } from '@/components/ChartCard';
import {
  HeartPulse,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Handshake,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

export function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.getDashboardMetrics,
  });

  const { data: usageTrends } = useQuery({
    queryKey: ['usage-trends'],
    queryFn: api.getUsageTrends,
  });

  const { data: supplierCosts } = useQuery({
    queryKey: ['supplier-costs'],
    queryFn: api.getSupplierCostComparison,
  });

  const { data: predictionConf } = useQuery({
    queryKey: ['prediction-confidence'],
    queryFn: api.getPredictionConfidence,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Dashboard</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          AI-powered overview of your restaurant inventory
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardCard
          title="Inventory Health"
          value={`${metrics?.healthScore ?? '--'}%`}
          change={3.2}
          changeLabel="vs last week"
          icon={<HeartPulse className="h-5 w-5" />}
          delay={0}
        />
        <DashboardCard
          title="Predicted Stockouts"
          value={metrics?.predictedStockouts ?? '--'}
          change={-2}
          changeLabel="fewer than last week"
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0.05}
        />
        <DashboardCard
          title="AI Cost Savings"
          value={`$${metrics?.costSavings ?? '--'}`}
          change={12.5}
          changeLabel="this month"
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.1}
        />
        <DashboardCard
          title="Next Orders"
          value={metrics?.nextOrders ?? '--'}
          change={0}
          changeLabel="scheduled"
          icon={<ShoppingCart className="h-5 w-5" />}
          delay={0.15}
        />
        <DashboardCard
          title="Supplier Deals"
          value={metrics?.supplierDeals ?? '--'}
          change={2}
          changeLabel="new this week"
          icon={<Handshake className="h-5 w-5" />}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Inventory Usage Trends"
          subtitle="Actual vs AI predicted usage (kg)"
          delay={0.25}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={usageTrends}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card-light)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="usage"
                name="Actual Usage"
                stroke="#2E7D32"
                fill="url(#usageGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                name="AI Predicted"
                stroke="#1565C0"
                fill="url(#predictedGrad)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Supplier Cost Comparison"
          subtitle="Current vs AI-optimized pricing ($)"
          delay={0.3}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={supplierCosts} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="supplier" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card-light)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="currentCost" name="Current Cost" fill="#DC2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aiSuggestedCost" name="AI Suggested" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="AI Prediction Confidence"
          subtitle="Model confidence by item"
          delay={0.35}
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={predictionConf}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="item" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9CA3AF" />
              <Radar
                name="Confidence %"
                dataKey="confidence"
                stroke="#1565C0"
                fill="#1565C0"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Quick Actions"
          subtitle="AI-recommended actions for today"
          delay={0.4}
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {[
              { title: 'Reorder Tomatoes', desc: 'Stock critically low — 3 days until depletion', urgency: 'critical', action: 'Order Now' },
              { title: 'Accept Fresh Farms Contract', desc: 'Save $42/week on vegetables with a 6-month deal', urgency: 'opportunity', action: 'Review' },
              { title: 'Shrimp order scheduled', desc: 'AI auto-scheduled 20kg from Ocean Catch for Mar 14', urgency: 'info', action: 'Modify' },
              { title: 'Weekend prep alert', desc: 'Expected 40% increase in seafood demand Fri-Sat', urgency: 'warning', action: 'View Details' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border-light dark:border-border-dark p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.urgency === 'critical'
                        ? 'bg-red-500'
                        : item.urgency === 'warning'
                        ? 'bg-amber-500'
                        : item.urgency === 'opportunity'
                        ? 'bg-emerald-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-text-light dark:text-text-dark">{item.title}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">{item.desc}</p>
                  </div>
                </div>
                <button className="rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 text-xs font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
