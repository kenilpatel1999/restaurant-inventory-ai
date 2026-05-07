import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatBot } from './ChatBot';
import { ChatPanel } from './FloatingChat/ChatPanel';
import { useTheme } from '@/hooks/useTheme';

export function Layout() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [floatingChatNotif, setFloatingChatNotif] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 260;
  const chatWidth = !isMobile && chatOpen ? 380 : 0;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarWidth, marginRight: chatWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex min-h-screen flex-col"
      >
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          onMenuClick={() => setMobileMenuOpen(true)}
          onChatToggle={() => setChatOpen((p) => !p)}
          chatOpen={chatOpen}
        />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </motion.div>

      <ChatBot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        isMobile={isMobile}
      />

      {/* Floating AI Agent Button */}
      <AnimatePresence>
        {!floatingChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => { setFloatingChatOpen(true); setFloatingChatNotif(0); }}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-colors"
            aria-label="Open AI Inventory Agent"
          >
            <Bot className="h-6 w-6" />
            {floatingChatNotif > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {floatingChatNotif}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <ChatPanel
        isOpen={floatingChatOpen}
        onClose={() => setFloatingChatOpen(false)}
        onMinimize={() => setFloatingChatOpen(false)}
      />
    </div>
  );
}
