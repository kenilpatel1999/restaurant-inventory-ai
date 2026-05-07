import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatBot } from './ChatBot';
import { useTheme } from '@/hooks/useTheme';

export function Layout() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
    </div>
  );
}
