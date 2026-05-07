import { Menu, Bell, Search, MessageSquare } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onMenuClick: () => void;
  onChatToggle: () => void;
  chatOpen: boolean;
}

export function Header({ isDark, toggleTheme, onMenuClick, onChatToggle, chatOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-light dark:border-border-dark bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2">
          <Search className="h-4 w-4 text-muted-light dark:text-muted-dark" />
          <input
            type="text"
            placeholder="Search inventory, suppliers..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-light dark:placeholder:text-muted-dark text-text-light dark:text-text-dark"
          />
          <kbd className="hidden md:inline-flex h-5 items-center rounded border border-border-light dark:border-border-dark px-1.5 text-[10px] font-medium text-muted-light dark:text-muted-dark">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onChatToggle}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            chatOpen
              ? 'bg-secondary/10 text-secondary dark:bg-secondary/20'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark'
          )}
          aria-label="Toggle AI Assistant"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-light dark:text-muted-dark">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <ThemeToggle isDark={isDark} toggle={toggleTheme} />

        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
          JD
        </div>
      </div>
    </header>
  );
}
