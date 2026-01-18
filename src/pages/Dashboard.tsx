import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { MarketBriefingWidget } from '@/components/dashboard/MarketBriefingWidget';
import { NewsWidget } from '@/components/dashboard/NewsWidget';
import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget';
import { ProfileWizard } from '@/components/onboarding/ProfileWizard';
import { FirstActionPrompts } from '@/components/onboarding/FirstActionPrompts';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { HeroStatsRow } from '@/components/dashboard/HeroStatsRow';
import { ContinueLearningWidget } from '@/components/dashboard/ContinueLearningWidget';
import { RecentlyViewedWidget } from '@/components/dashboard/RecentlyViewedWidget';
import { QuickActionsDock } from '@/components/dashboard/QuickActionsDock';
import { MemberJourneyCard } from '@/components/dashboard/MemberJourneyCard';

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    showWelcomeModal,
    showProfileWizard,
    isCompleted: onboardingCompleted,
    actionsCompleted,
    dismissWelcomeModal,
    startProfileWizard,
    closeProfileWizard,
    completeOnboarding,
    skipOnboarding,
    markActionComplete,
  } = useOnboarding();

  // Check for pending OAuth checkout intent (using sessionStorage for security)
  useEffect(() => {
    const pendingOAuth = sessionStorage.getItem('pending_oauth_checkout');
    const pendingTier = sessionStorage.getItem('pending_checkout_tier');
    
    if (pendingOAuth && pendingTier && (pendingTier === 'investor' || pendingTier === 'elite')) {
      sessionStorage.removeItem('pending_oauth_checkout');
      sessionStorage.removeItem('pending_checkout_tier');
      sessionStorage.removeItem('pending_checkout_billing');
      sessionStorage.removeItem('pending_checkout_upgrade');
      navigate(`/checkout/${pendingTier}`);
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="w-32 h-6 bg-muted rounded animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-6 bg-muted rounded-full animate-pulse" />
              <div className="w-24 h-9 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </header>
        
        {/* Skeleton Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Hero stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-xl bg-muted animate-pulse mb-3" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Widgets skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border min-h-[160px]">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'Investor';
  const membershipTier = (profile?.membership_tier || 'free') as string;
  const isPrivate = membershipTier === 'private';
  const isElite = membershipTier === 'elite';
  const isInvestor = membershipTier === 'investor';
  const isPaidMember = isPrivate || isElite || isInvestor;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Onboarding Wizard (includes welcome step) */}
      <ProfileWizard
        isOpen={showWelcomeModal || showProfileWizard}
        onClose={() => {
          dismissWelcomeModal();
          closeProfileWizard();
          skipOnboarding();
        }}
        onComplete={completeOnboarding}
        showWelcome={showWelcomeModal}
        userName={firstName}
      />

      {/* Onboarding Checklist Widget */}
      {!onboardingCompleted && (
        <OnboardingChecklist
          profileComplete={!!profile?.onboarding_completed_at}
          actionsCompleted={actionsCompleted}
          onOpenWizard={startProfileWizard}
          onDismiss={skipOnboarding}
        />
      )}

      {/* Compact Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-primary-dark font-heading font-bold text-base">DW</span>
            </div>
            <span className="font-heading text-lg text-foreground hidden sm:inline">Dubai Wealth Hub</span>
          </a>

          <div className="flex items-center gap-2">
            {/* Membership Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
              isPrivate
                ? 'bg-gradient-to-r from-gold/20 to-amber-500/20 text-amber-400 border border-gold/30'
                : isElite 
                  ? 'bg-gold/20 text-gold border border-gold/30' 
                  : isInvestor 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-muted text-muted-foreground'
            }`}>
              {(isPrivate || isElite) && <Crown className="w-3 h-3 inline mr-1" />}
              {membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)}
            </div>

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9 px-3">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your Dubai investment dashboard
            </p>
          </div>

          {/* Floating AI Button - Desktop */}
          <Button 
            onClick={() => navigate('/ai')}
            className="hidden md:flex gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
        </motion.div>

        {/* First Action Prompts (for new users) */}
        {!onboardingCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <FirstActionPrompts
              actionsCompleted={actionsCompleted}
              onActionClick={markActionComplete}
            />
          </motion.div>
        )}

        {/* Member Journey Stages */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <MemberJourneyCard />
        </motion.div>

        {/* Hero Stats Row - Bento Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6"
        >
          <HeroStatsRow isPaidMember={isPaidMember} isElite={isElite || isPrivate} />
        </motion.div>

        {/* Main Content Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column - Learning & Properties */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ContinueLearningWidget />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <RecentlyViewedWidget />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <QuickActionsDock isElite={isElite} isPrivate={isPrivate} />
            </motion.div>
          </div>

          {/* Right Column - Briefing, AI, News, Events */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MarketBriefingWidget />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <AIInsightsCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <NewsWidget />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <UpcomingEventsWidget />
            </motion.div>
          </div>
        </div>

        {/* Mobile AI Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-6 right-6 md:hidden z-50"
        >
          <Button
            onClick={() => navigate('/ai')}
            size="lg"
            aria-label="Open AI Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-pink-500/25"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
