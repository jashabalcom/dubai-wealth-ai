import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type JourneyStage = 1 | 2 | 3 | 4 | 5;

export interface JourneyStageInfo {
  stage: JourneyStage;
  name: string;
  description: string;
  icon: 'compass' | 'calculator' | 'search' | 'file-check' | 'building';
}

export interface MemberJourneyData {
  currentStage: JourneyStage;
  stageName: string;
  stageDescription: string;
  stageIcon: JourneyStageInfo['icon'];
  progress: number; // 0-100 percentage to next stage
  nextMilestone: string;
  nextMilestoneAction?: string; // Route to navigate to
  metrics: {
    lessonsCompleted: number;
    savedProperties: number;
    communityPosts: number;
    eventsAttended: number;
  };
  allStages: JourneyStageInfo[];
}

const STAGES: JourneyStageInfo[] = [
  { stage: 1, name: 'Explorer', description: 'Learning the fundamentals', icon: 'compass' },
  { stage: 2, name: 'Analyst', description: 'Running numbers & comparing deals', icon: 'calculator' },
  { stage: 3, name: 'Active Searcher', description: 'Actively exploring opportunities', icon: 'search' },
  { stage: 4, name: 'Deal Evaluator', description: 'Ready to evaluate real deals', icon: 'file-check' },
  { stage: 5, name: 'Portfolio Builder', description: 'Advanced investor status', icon: 'building' },
];

function calculateStage(
  lessonsCompleted: number,
  savedProperties: number,
  communityPosts: number,
  eventsAttended: number,
  membershipTier: string
): { stage: JourneyStage; progress: number; nextMilestone: string; nextAction?: string } {
  const isPaidMember = ['investor', 'elite', 'private'].includes(membershipTier);
  const isHighTier = ['elite', 'private'].includes(membershipTier);

  // Stage 5: Portfolio Builder
  // Requirements: Elite/Private tier AND 15+ lessons AND 10+ saved properties
  if (isHighTier && lessonsCompleted >= 15 && savedProperties >= 10) {
    return {
      stage: 5,
      progress: 100,
      nextMilestone: "You've reached Portfolio Builder status! 🎉",
    };
  }

  // Stage 4: Deal Evaluator
  // Requirements: Paid member AND 10+ lessons AND 5+ saved properties
  if (isPaidMember && lessonsCompleted >= 10 && savedProperties >= 5) {
    const lessonsToGo = Math.max(0, 15 - lessonsCompleted);
    const propertiesToGo = Math.max(0, 10 - savedProperties);
    const needsUpgrade = !isHighTier;
    
    let progress = 0;
    if (isHighTier) {
      const lessonProgress = Math.min(lessonsCompleted, 15) / 15;
      const propertyProgress = Math.min(savedProperties, 10) / 10;
      progress = Math.round(((lessonProgress + propertyProgress) / 2) * 100);
    } else {
      progress = 75; // Can't progress without upgrade
    }

    if (needsUpgrade) {
      return {
        stage: 4,
        progress,
        nextMilestone: 'Upgrade to Elite to unlock Portfolio Builder',
        nextAction: '/pricing',
      };
    }
    
    return {
      stage: 4,
      progress,
      nextMilestone: `Complete ${lessonsToGo} more lessons & save ${propertiesToGo} more properties`,
      nextAction: lessonsToGo > 0 ? '/learn' : '/properties',
    };
  }

  // Stage 3: Active Searcher
  // Requirements: 5+ lessons AND 3+ saved properties AND (1+ post OR 1+ event)
  if (lessonsCompleted >= 5 && savedProperties >= 3 && (communityPosts >= 1 || eventsAttended >= 1)) {
    const lessonsToGo = Math.max(0, 10 - lessonsCompleted);
    const propertiesToGo = Math.max(0, 5 - savedProperties);
    const needsUpgrade = !isPaidMember;
    
    const lessonProgress = Math.min(lessonsCompleted, 10) / 10;
    const propertyProgress = Math.min(savedProperties, 5) / 5;
    const progress = Math.round(((lessonProgress + propertyProgress) / 2) * 100);

    if (needsUpgrade && lessonsCompleted >= 10 && savedProperties >= 5) {
      return {
        stage: 3,
        progress,
        nextMilestone: 'Upgrade to Investor to become a Deal Evaluator',
        nextAction: '/pricing',
      };
    }
    
    return {
      stage: 3,
      progress,
      nextMilestone: `Complete ${lessonsToGo} more lessons to unlock Deal Evaluator`,
      nextAction: '/learn',
    };
  }

  // Stage 2: Analyst
  // Requirements: 3+ lessons completed OR 2+ saved properties
  if (lessonsCompleted >= 3 || savedProperties >= 2) {
    const lessonsNeeded = 5;
    const propertiesNeeded = 3;
    const communityNeeded = communityPosts < 1 && eventsAttended < 1;
    
    const lessonProgress = Math.min(lessonsCompleted, lessonsNeeded) / lessonsNeeded;
    const propertyProgress = Math.min(savedProperties, propertiesNeeded) / propertiesNeeded;
    const communityProgress = (communityPosts >= 1 || eventsAttended >= 1) ? 1 : 0;
    const progress = Math.round(((lessonProgress + propertyProgress + communityProgress) / 3) * 100);

    if (lessonsCompleted < 5) {
      return {
        stage: 2,
        progress,
        nextMilestone: `Complete ${5 - lessonsCompleted} more lessons`,
        nextAction: '/learn',
      };
    }
    if (savedProperties < 3) {
      return {
        stage: 2,
        progress,
        nextMilestone: `Save ${3 - savedProperties} more properties`,
        nextAction: '/properties',
      };
    }
    if (communityNeeded) {
      return {
        stage: 2,
        progress,
        nextMilestone: 'Join the community or attend an event',
        nextAction: '/community',
      };
    }
    
    return {
      stage: 2,
      progress,
      nextMilestone: 'Continue exploring to advance',
      nextAction: '/learn',
    };
  }

  // Stage 1: Explorer (default)
  const lessonProgress = Math.min(lessonsCompleted, 3) / 3;
  const propertyProgress = Math.min(savedProperties, 2) / 2;
  const progress = Math.round(((lessonProgress + propertyProgress) / 2) * 100);
  
  if (lessonsCompleted === 0) {
    return {
      stage: 1,
      progress,
      nextMilestone: 'Complete your first lesson',
      nextAction: '/learn',
    };
  }
  
  return {
    stage: 1,
    progress,
    nextMilestone: `Complete ${3 - lessonsCompleted} more lessons to become an Analyst`,
    nextAction: '/learn',
  };
}

export function useMemberJourney() {
  const { user, profile } = useAuth();
  const userId = user?.id;
  const membershipTier = profile?.membership_tier || 'free';

  return useQuery({
    queryKey: ['member-journey', userId],
    queryFn: async (): Promise<MemberJourneyData> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch all metrics in parallel
      const [
        savedPropertiesResult,
        lessonsResult,
        postsResult,
        eventsResult,
      ] = await Promise.all([
        supabase
          .from('saved_properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('lesson_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true),
        supabase
          .from('community_posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('event_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      const metrics = {
        lessonsCompleted: lessonsResult.count || 0,
        savedProperties: savedPropertiesResult.count || 0,
        communityPosts: postsResult.count || 0,
        eventsAttended: eventsResult.count || 0,
      };

      const { stage, progress, nextMilestone, nextAction } = calculateStage(
        metrics.lessonsCompleted,
        metrics.savedProperties,
        metrics.communityPosts,
        metrics.eventsAttended,
        membershipTier
      );

      const currentStageInfo = STAGES.find(s => s.stage === stage)!;

      return {
        currentStage: stage,
        stageName: currentStageInfo.name,
        stageDescription: currentStageInfo.description,
        stageIcon: currentStageInfo.icon,
        progress,
        nextMilestone,
        nextMilestoneAction: nextAction,
        metrics,
        allStages: STAGES,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
