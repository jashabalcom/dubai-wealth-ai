import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Grid3X3, List, SortAsc } from 'lucide-react';
import { MemberCard } from '@/components/community/MemberCard';
import { DirectoryFilters, MobileFilterBar } from '@/components/community/DirectoryFilters';
import { CommunityPageHeader } from '@/components/community/CommunityPageHeader';
import { SidebarCard } from '@/components/community/SidebarCard';
import { QuickStats } from '@/components/community/QuickStats';
import { PageTransition } from '@/components/community/PageTransition';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemberDirectory } from '@/hooks/useMemberDirectory';
import { COMMUNITY_LAYOUT } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    members,
    totalCount,
    membersLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    sortBy,
    setSortBy,
    refetchMembers,
  } = useMemberDirectory();

  const handleRefresh = useCallback(async () => {
    await refetchMembers();
  }, [refetchMembers]);

  // Calculate quick stats (placeholder values - can be enhanced with real data)
  const onlineCount = Math.floor(totalCount * 0.1); // Placeholder: 10% online
  const newThisWeek = Math.min(12, Math.floor(totalCount * 0.05)); // Placeholder

  const ViewToggle = (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('grid')}
          className={cn(
            'h-8 w-8 p-0',
            viewMode === 'grid' && 'bg-gold/20 text-gold'
          )}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('list')}
          className={cn(
            'h-8 w-8 p-0',
            viewMode === 'list' && 'bg-gold/20 text-gold'
          )}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'alphabetical')}>
        <SelectTrigger className="hidden lg:flex w-[130px] bg-muted/30 border-border/40">
          <SortAsc className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh} disabled={membersLoading}>
        <div className={COMMUNITY_LAYOUT.spacing.content}>
          {/* Header */}
          <CommunityPageHeader
            title="Member Directory"
            subtitle={`Connect with ${totalCount.toLocaleString()} Dubai investors`}
            icon={Users}
            actions={ViewToggle}
          />

          {/* Mobile Filter Bar - Sticky */}
          <MobileFilterBar
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            sortBy={sortBy}
            onSortChange={(v) => setSortBy(v as 'newest' | 'alphabetical')}
          />

          {/* 12-Column Grid Layout */}
          <div className={COMMUNITY_LAYOUT.grid.container}>
            {/* Left Sidebar - Filters (Desktop only) */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(COMMUNITY_LAYOUT.grid.leftSidebar, 'hidden lg:block')}
            >
              <SidebarCard>
                <DirectoryFilters
                  filters={filters}
                  filterOptions={filterOptions}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </SidebarCard>
            </motion.aside>

            {/* Main Content - Members Grid */}
            <div className={cn(COMMUNITY_LAYOUT.grid.mainContent, 'lg:col-span-6 col-span-full')}>
              {membersLoading ? (
                <div className={COMMUNITY_LAYOUT.memberGrid.container}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(COMMUNITY_LAYOUT.card.base, COMMUNITY_LAYOUT.card.padding, 'animate-pulse')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-muted/50 rounded-full shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-5 w-28 bg-muted/50 rounded" />
                          <div className="h-4 w-20 bg-muted/50 rounded" />
                          <div className="h-4 w-full bg-muted/50 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(COMMUNITY_LAYOUT.card.base, COMMUNITY_LAYOUT.card.padding, 'text-center py-12')}
                >
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-serif font-semibold mb-2">No members found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {hasActiveFilters
                      ? 'Try adjusting your filters to find more members.'
                      : 'No members have made their profiles visible yet.'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="border-border/40">
                      Clear Filters
                    </Button>
                  )}
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4 hidden lg:block">
                    Showing {members.length} of {totalCount} members
                  </p>
                  <div className={viewMode === 'grid' ? COMMUNITY_LAYOUT.memberGrid.container : COMMUNITY_LAYOUT.memberGrid.list}>
                    {members.map((member, index) => (
                      <MemberCard 
                        key={member.id} 
                        member={member} 
                        index={index}
                        variant={viewMode}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar - Quick Stats (Desktop only) */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={cn(COMMUNITY_LAYOUT.grid.rightSidebar, 'hidden lg:block')}
            >
              <SidebarCard>
                <QuickStats
                  totalMembers={totalCount}
                  onlineCount={onlineCount}
                  newThisWeek={newThisWeek}
                />
              </SidebarCard>
            </motion.aside>
          </div>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}