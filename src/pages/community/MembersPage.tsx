import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Grid3X3, List, SortAsc } from 'lucide-react';
import { MemberCard } from '@/components/community/MemberCard';
import { DirectoryFilters } from '@/components/community/DirectoryFilters';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemberDirectory } from '@/hooks/useMemberDirectory';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
  } = useMemberDirectory();

  return (
    <div className="space-y-5">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold">Member Directory</h2>
          <p className="text-sm text-muted-foreground">
            Connect with {totalCount} Dubai investors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
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
            <SelectTrigger className="w-[130px] bg-muted/30 border-border/50">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Filters */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sticky top-28 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <DirectoryFilters
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>
        </motion.aside>

        {/* Members Grid/List */}
        <div className="lg:col-span-3">
          {membersLoading ? (
            <div className={cn(
              'gap-4',
              viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'
            )}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 bg-muted/50 rounded-full" />
                    <div className="flex-1 space-y-2">
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
              className="text-center py-12 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl"
            >
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-serif font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters to find more members.'
                  : 'No members have made their profiles visible yet.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Showing {members.length} of {totalCount} members
              </p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                  'gap-4',
                  viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'
                )}
              >
                {members.map((member) => (
                  <motion.div key={member.id} variants={itemVariants}>
                    <MemberCard member={member} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
