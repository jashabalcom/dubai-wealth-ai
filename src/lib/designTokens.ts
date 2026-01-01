// Community Layout Design Tokens
// Centralized design constants for consistent styling across all community pages

export const COMMUNITY_LAYOUT = {
  // Grid System
  grid: {
    container: 'grid grid-cols-1 lg:grid-cols-12 gap-6',
    leftSidebar: 'lg:col-span-3',
    mainContent: 'lg:col-span-6',
    rightSidebar: 'lg:col-span-3',
    twoColumn: {
      sidebar: 'lg:col-span-3',
      content: 'lg:col-span-9',
    },
  },

  // Card Styles
  card: {
    base: 'bg-card/90 backdrop-blur-xl border border-border/40 rounded-3xl shadow-lg shadow-black/5',
    padding: 'p-5 sm:p-6',
    hover: 'hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30 transition-all duration-300',
    gradient: 'absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500',
  },

  // Premium Card (for member cards, featured items)
  premiumCard: {
    base: 'bg-card/90 backdrop-blur-xl border border-border/40 rounded-3xl shadow-lg overflow-hidden',
    elite: 'bg-gradient-to-br from-gold/8 via-transparent to-gold/5',
    innerGlow: 'shadow-[inset_0_1px_1px_hsl(var(--gold)/0.1)]',
  },

  // Sidebar
  sidebar: {
    sticky: 'sticky top-28',
    container: 'bg-card/90 backdrop-blur-xl border border-border/40 rounded-3xl p-5 shadow-lg shadow-black/5',
  },

  // Section Spacing
  spacing: {
    section: 'space-y-6',
    content: 'space-y-5',
    compact: 'space-y-3',
  },

  // Member Grid
  memberGrid: {
    container: 'grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6',
    list: 'space-y-4',
  },

  // Button Styles
  button: {
    primary: 'bg-gradient-to-r from-gold via-gold to-gold/90 text-secondary font-semibold hover:from-gold hover:via-gold/95 hover:to-gold/85 hover:shadow-lg hover:shadow-gold/30',
    outline: 'border-border/50 hover:border-gold/40 hover:text-gold hover:bg-gold/5',
  },

  // Avatar Styles
  avatar: {
    ring: {
      default: 'ring-2 ring-card',
      elite: 'ring-2 ring-gold/50',
      hover: 'group-hover:ring-gold/30',
    },
    gradient: {
      elite: 'bg-gradient-to-br from-gold via-gold/60 to-gold',
      default: 'bg-gradient-to-br from-border/50 to-border/30',
    },
  },
} as const;

// Reusable class combinations
export const sidebarCardClasses = `${COMMUNITY_LAYOUT.sidebar.container} ${COMMUNITY_LAYOUT.sidebar.sticky}`;

export const memberGridClasses = COMMUNITY_LAYOUT.memberGrid.container;

export const pageContentClasses = COMMUNITY_LAYOUT.spacing.content;
