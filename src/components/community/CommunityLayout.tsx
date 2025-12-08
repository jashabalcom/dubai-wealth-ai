import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CommunitySidebar } from './CommunitySidebar';
import { CommunityMobileNav } from './CommunityMobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export function CommunityLayout() {
  const { user, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 relative pt-20 md:pt-24">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Header - Only show on desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 shadow-lg shadow-gold/10">
                <Users className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-gold bg-clip-text text-transparent">
                  Community Hub
                </h1>
                <p className="text-muted-foreground text-sm">
                  Connect, discuss, and grow with fellow Dubai investors
                </p>
              </div>
            </motion.div>
          )}

          {/* Main Content Area */}
          <div className="flex gap-6">
            {/* Sidebar - Desktop Only */}
            {!isMobile && (
              <CommunitySidebar 
                collapsed={sidebarCollapsed} 
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && <CommunityMobileNav />}
      </main>

      {!isMobile && <Footer />}
    </div>
  );
}
