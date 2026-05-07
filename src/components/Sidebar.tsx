import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  BrainCircuit,
  Truck,
  FileText,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  Leaf,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/predictions', label: 'Predictions', icon: BrainCircuit },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/contracts', label: 'Contracts', icon: FileText },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn(
        'flex h-16 items-center border-b border-border-light dark:border-border-dark px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-bold text-text-light dark:text-text-dark whitespace-nowrap overflow-hidden"
            >
              FreshStock AI
            </motion.span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'hidden lg:flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onMobileClose}
          className="flex lg:hidden h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                  : 'text-muted-light dark:text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-light dark:hover:text-text-dark'
              )
            }
          >
            <item.icon className={cn('h-5 w-5 shrink-0')} />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn(
        'border-t border-border-light dark:border-border-dark p-4',
        collapsed ? 'text-center' : ''
      )}>
        {!collapsed ? (
          <div className="rounded-lg bg-primary/5 dark:bg-primary/10 p-3">
            <p className="text-xs font-semibold text-primary dark:text-primary-light">AI Status</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-light dark:text-muted-dark">Active & Learning</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex h-screen flex-col border-r border-border-light dark:border-border-dark',
          'bg-card-light dark:bg-card-dark fixed left-0 top-0 z-30'
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 h-screen w-[260px] border-r border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
