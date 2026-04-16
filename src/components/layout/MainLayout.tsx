import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { PageTransition } from './PageTransition';
import { useThemeStore, applyTheme } from '@/stores/themeStore';

export function MainLayout() {
  const location = useLocation();
  const { theme: currentMode } = useTheme();
  const { getActiveTheme, activeThemeId } = useThemeStore();

  useEffect(() => {
    const theme = getActiveTheme();
    applyTheme(theme, currentMode === 'dark');
  }, [activeThemeId, currentMode, getActiveTheme]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
