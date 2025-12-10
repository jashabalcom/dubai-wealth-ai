import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface OnboardingState {
  showWelcomeModal: boolean;
  showProfileWizard: boolean;
  currentStep: number;
  isCompleted: boolean;
  actionsCompleted: {
    savedProperty: boolean;
    triedCalculator: boolean;
    exploredAcademy: boolean;
    joinedCommunity: boolean;
  };
}

const ACTIONS_STORAGE_KEY = 'onboarding_actions';

export function useOnboarding() {
  const { user, profile } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    showWelcomeModal: false,
    showProfileWizard: false,
    currentStep: 0,
    isCompleted: false,
    actionsCompleted: {
      savedProperty: false,
      triedCalculator: false,
      exploredAcademy: false,
      joinedCommunity: false,
    },
  });
  const [loading, setLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    // Check if onboarding is completed
    const isCompleted = !!profile.onboarding_completed_at;
    const currentStep = profile.onboarding_step || 0;
    
    // Check localStorage for action completion
    const savedActions = localStorage.getItem(ACTIONS_STORAGE_KEY);
    const actionsCompleted = savedActions 
      ? JSON.parse(savedActions) 
      : {
          savedProperty: false,
          triedCalculator: false,
          exploredAcademy: false,
          joinedCommunity: false,
        };

    // Check if welcome modal was shown this session
    const welcomeShown = sessionStorage.getItem('welcome_modal_shown');
    
    setState({
      showWelcomeModal: !isCompleted && !welcomeShown,
      showProfileWizard: false,
      currentStep,
      isCompleted,
      actionsCompleted,
    });
    
    setLoading(false);
  }, [user, profile]);

  const dismissWelcomeModal = useCallback(() => {
    sessionStorage.setItem('welcome_modal_shown', 'true');
    setState(prev => ({ ...prev, showWelcomeModal: false }));
  }, []);

  const startProfileWizard = useCallback(() => {
    sessionStorage.setItem('welcome_modal_shown', 'true');
    setState(prev => ({ 
      ...prev, 
      showWelcomeModal: false, 
      showProfileWizard: true 
    }));
  }, []);

  const closeProfileWizard = useCallback(() => {
    setState(prev => ({ ...prev, showProfileWizard: false }));
  }, []);

  const updateStep = useCallback(async (step: number) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('id', user.id);
      
      setState(prev => ({ ...prev, currentStep: step }));
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed_at: new Date().toISOString(),
          onboarding_step: 4 
        })
        .eq('id', user.id);
      
      setState(prev => ({ 
        ...prev, 
        isCompleted: true, 
        showProfileWizard: false,
        currentStep: 4 
      }));
      
      toast.success('Profile setup complete!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save profile');
    }
  }, [user]);

  const skipOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', user.id);
      
      setState(prev => ({ 
        ...prev, 
        isCompleted: true, 
        showWelcomeModal: false,
        showProfileWizard: false 
      }));
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  }, [user]);

  const markActionComplete = useCallback((action: keyof OnboardingState['actionsCompleted']) => {
    setState(prev => {
      const newActions = { ...prev.actionsCompleted, [action]: true };
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(newActions));
      return { ...prev, actionsCompleted: newActions };
    });
  }, []);

  const getCompletedActionsCount = useCallback(() => {
    return Object.values(state.actionsCompleted).filter(Boolean).length;
  }, [state.actionsCompleted]);

  return {
    ...state,
    loading,
    dismissWelcomeModal,
    startProfileWizard,
    closeProfileWizard,
    updateStep,
    completeOnboarding,
    skipOnboarding,
    markActionComplete,
    getCompletedActionsCount,
  };
}
