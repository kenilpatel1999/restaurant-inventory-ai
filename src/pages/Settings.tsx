import { motion } from 'framer-motion';
import { Bell, Shield, BrainCircuit, User } from 'lucide-react';

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 border-b border-border-light dark:border-border-dark last:border-0">
      <div>
        <p className="text-sm font-medium text-text-light dark:text-text-dark">{label}</p>
        <p className="text-xs text-muted-light dark:text-muted-dark">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <div className="h-5 w-9 rounded-full bg-gray-300 dark:bg-gray-600 peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );
}

export function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Settings</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          Configure your account and AI preferences
        </p>
      </div>

      {[
        {
          title: 'Profile',
          icon: <User className="h-4 w-4" />,
          items: (
            <>
              <SettingRow label="Restaurant Name" description="Display name for your establishment">
                <input
                  type="text"
                  defaultValue="Bella Vista Italian Kitchen"
                  className="rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-1.5 text-sm text-text-light dark:text-text-dark outline-none focus:border-primary w-64"
                />
              </SettingRow>
              <SettingRow label="Email" description="Account email for notifications">
                <input
                  type="email"
                  defaultValue="john@bellavista.com"
                  className="rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-1.5 text-sm text-text-light dark:text-text-dark outline-none focus:border-primary w-64"
                />
              </SettingRow>
            </>
          ),
        },
        {
          title: 'AI Preferences',
          icon: <BrainCircuit className="h-4 w-4" />,
          items: (
            <>
              <SettingRow label="Auto-schedule Orders" description="Let AI automatically schedule reorders based on predictions">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Confidence Threshold" description="Minimum AI confidence level to trigger auto-actions">
                <select className="rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-1.5 text-sm text-text-light dark:text-text-dark outline-none">
                  <option>80%</option>
                  <option>85%</option>
                  <option selected>90%</option>
                  <option>95%</option>
                </select>
              </SettingRow>
              <SettingRow label="Prediction Horizon" description="How far ahead the AI should forecast">
                <select className="rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-1.5 text-sm text-text-light dark:text-text-dark outline-none">
                  <option>3 days</option>
                  <option selected>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                </select>
              </SettingRow>
              <SettingRow label="Contract Suggestions" description="Receive AI-generated contract suggestions from suppliers">
                <Toggle defaultOn />
              </SettingRow>
            </>
          ),
        },
        {
          title: 'Notifications',
          icon: <Bell className="h-4 w-4" />,
          items: (
            <>
              <SettingRow label="Low Stock Alerts" description="Get notified when items reach critical levels">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Order Confirmations" description="Receive confirmation when orders are placed">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Weekly Reports" description="AI-generated weekly inventory summary">
                <Toggle />
              </SettingRow>
            </>
          ),
        },
        {
          title: 'Data & Privacy',
          icon: <Shield className="h-4 w-4" />,
          items: (
            <>
              <SettingRow label="Data Retention" description="How long to keep historical inventory data">
                <select className="rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-1.5 text-sm text-text-light dark:text-text-dark outline-none">
                  <option>6 months</option>
                  <option selected>1 year</option>
                  <option>2 years</option>
                  <option>Forever</option>
                </select>
              </SettingRow>
              <SettingRow label="Share Data with Suppliers" description="Allow anonymized usage data sharing for better pricing">
                <Toggle />
              </SettingRow>
            </>
          ),
        },
      ].map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
        >
          <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark px-5 py-3">
            <span className="text-primary">{section.icon}</span>
            <h2 className="text-sm font-semibold text-text-light dark:text-text-dark">{section.title}</h2>
          </div>
          <div className="px-5">{section.items}</div>
        </motion.div>
      ))}
    </div>
  );
}
