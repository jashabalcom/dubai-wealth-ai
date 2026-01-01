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
    base: 'bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg shadow-black/5',
    padding: 'p-5',
    hover: 'hover:shadow-xl hover:shadow-gold/5 hover:border-gold/20 transition-all duration-300',
    gradient: 'absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none',
  },

  // Sidebar
  sidebar: {
    sticky: 'sticky top-28',
    container: 'bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-lg shadow-black/5',
  },

  // Section Spacing
  spacing: {
    section: 'space-y-6',
    content: 'space-y-5',
    compact: 'space-y-3',
  },

  // Member Grid
  memberGrid: {
    container: 'grid grid-cols-1 md:grid-cols-2 gap-5',
    list: 'space-y-4',
  },
} as const;

// Reusable class combinations
export const sidebarCardClasses = `${COMMUNITY_LAYOUT.sidebar.container} ${COMMUNITY_LAYOUT.sidebar.sticky}`;

export const memberGridClasses = COMMUNITY_LAYOUT.memberGrid.container;

export const pageContentClasses = COMMUNITY_LAYOUT.spacing.content;
