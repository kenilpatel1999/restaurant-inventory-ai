import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { ChartCard } from '@/components/ChartCard';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingDown, CalendarClock, Lightbulb } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function Predictions() {
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: api.getPredictions,
  });

  const { data: depletion = [] } = useQuery({
    queryKey: ['depletion'],
    queryFn: api.getDepletionPrediction,
  });

  const { data: forecast = [] } = useQuery({
    queryKey: ['weekly-forecast'],
    queryFn: api.getWeeklyForecast,
  });

  const { data: reorder = [] } = useQuery({
    queryKey: ['reorder-schedule'],
    queryFn: api.getReorderSchedule,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">AI Predictions</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          Forecasts and reorder recommendations powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Inventory Depletion Forecast" subtitle="Predicted stock levels over next 7 days (kg)" delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={depletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="tomatoes" name="Tomatoes" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="mozzarella" name="Mozzarella" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="basil" name="Basil" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="shrimp" name="Shrimp" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="chicken" name="Chicken" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Usage Forecast" subtitle="Actual vs forecasted total usage (kg)" delay={0.15}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }} />
              <Legend />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="forecast" name="AI Forecast" stroke="#1565C0" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="AI Reorder Schedule" subtitle="Upcoming AI-recommended orders for the next 7 days" delay={0.2}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reorder}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-light)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="items" name="Items to Order" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="cost" name="Est. Cost ($)" fill="#1565C0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          AI Reasoning Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((pred, i) => (
            <motion.div
              key={pred.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">{pred.itemName}</h3>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Depletes by {new Date(pred.depletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-secondary/10 dark:bg-secondary/20 px-2 py-0.5">
                  <BrainCircuit className="h-3 w-3 text-secondary" />
                  <span className="text-xs font-semibold text-secondary">{pred.confidence}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-light dark:text-muted-dark">
                  <TrendingDown className="h-3 w-3" />
                  <span>Stock: {pred.currentStock}kg</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-light dark:text-muted-dark">
                  <CalendarClock className="h-3 w-3" />
                  <span>Reorder: {new Date(pred.reorderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2.5">
                <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
                  {pred.reasoning}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-light dark:text-muted-dark">
                  Order {pred.suggestedQuantity}kg &middot; ~${pred.estimatedCost}
                </span>
                <button className="rounded-lg bg-primary/10 dark:bg-primary/20 px-2.5 py-1 font-medium text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                  Accept
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
