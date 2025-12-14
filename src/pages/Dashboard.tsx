import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Users, 
  Brain, 
  Crown,
  ArrowRight,
  LogOut,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { ProfileWizard } from '@/components/onboarding/ProfileWizard';
import { FirstActionPrompts } from '@/components/onboarding/FirstActionPrompts';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';

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

  // Check for pending OAuth checkout intent
  useEffect(() => {
    const pendingOAuth = localStorage.getItem('pending_oauth_checkout');
    const pendingTier = localStorage.getItem('pending_checkout_tier');
    
    if (pendingOAuth && pendingTier && (pendingTier === 'investor' || pendingTier === 'elite')) {
      localStorage.removeItem('pending_oauth_checkout');
      localStorage.removeItem('pending_checkout_tier');
      localStorage.removeItem('pending_checkout_upgrade');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'Investor';
  const membershipTier = profile?.membership_tier || 'free';
  const isElite = membershipTier === 'elite';
  const isInvestor = membershipTier === 'investor';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickActions = [
    {
      icon: GraduationCap,
      title: 'Academy',
      description: 'Continue learning Dubai real estate',
      href: '/academy',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Building2,
      title: 'Properties',
      description: 'Browse investment opportunities',
      href: '/properties',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Tools',
      description: 'ROI & investment calculators',
      href: '/tools',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with investors',
      href: '/community',
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Get personalized advice',
      href: '/ai',
      color: 'bg-pink-500/10 text-pink-500',
    },
    {
      icon: Heart,
      title: 'Saved Properties',
      description: 'View your saved investments',
      href: '/properties/saved',
      color: 'bg-rose-500/10 text-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Modals */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        userName={firstName}
        onStartWizard={startProfileWizard}
        onExplore={() => {
          dismissWelcomeModal();
          skipOnboarding();
        }}
      />

      <ProfileWizard
        isOpen={showProfileWizard}
        onClose={closeProfileWizard}
        onComplete={completeOnboarding}
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

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-primary-dark font-heading font-bold text-lg">DW</span>
            </div>
            <span className="font-heading text-xl text-foreground hidden sm:inline">Dubai Wealth Hub</span>
          </a>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Membership Badge */}
            <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
              isElite 
                ? 'bg-gold/20 text-gold border border-gold/30' 
                : isInvestor 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {isElite && <Crown className="w-3 h-3 inline mr-1" />}
              <span className="hidden xs:inline">{membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)} </span>Member
            </div>

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="min-h-[44px] px-2 sm:px-4">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your Dubai investments
          </p>
        </motion.div>

        {/* Upgrade CTA for non-Elite */}
        {!isElite && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-gold" />
                  <span className="text-gold font-medium">Upgrade to Elite</span>
                </div>
                <p className="text-muted-foreground">
                  Get priority access to off-plan launches, advanced AI tools, and portfolio tracking.
                </p>
              </div>
              <Button variant="gold" onClick={() => navigate('/upgrade')}>
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* First Action Prompts (for new users) */}
        {!onboardingCompleted && (
          <FirstActionPrompts
            actionsCompleted={actionsCompleted}
            onActionClick={markActionComplete}
          />
        )}

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-heading text-xl text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="group p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-gold/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 sm:mb-4`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-heading text-base sm:text-lg text-foreground mb-1 group-hover:text-gold transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{action.description}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* AI-Powered Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <AIInsightsCard />
        </motion.div>
      </main>
    </div>
  );
}
