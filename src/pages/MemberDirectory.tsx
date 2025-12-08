import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Grid3X3, List, SortAsc } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
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
import { useAuth } from '@/hooks/useAuth';
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

export default function MemberDirectory() {
  const { user, loading: authLoading } = useAuth();
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

      <main className="flex-1 relative">
        {/* Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 shadow-lg shadow-gold/10">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-gold bg-clip-text text-transparent">
                  Member Directory
                </h1>
                <p className="text-muted-foreground mt-1">
                  Connect with {totalCount} Dubai investors
                </p>
              </div>
            </div>

            {/* View & Sort Controls */}
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
                <SelectTrigger className="w-[140px] bg-muted/30 border-border/50">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sticky top-24 shadow-xl shadow-black/5">
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
                  'gap-5',
                  viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'
                )}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border/50 rounded-2xl p-6 animate-pulse"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-muted/50 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 w-32 bg-muted/50 rounded" />
                          <div className="h-4 w-24 bg-muted/50 rounded" />
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
                  className="text-center py-16 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl"
                >
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-semibold mb-2">No members found</h3>
                  <p className="text-muted-foreground mb-4">
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
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {members.length} of {totalCount} members
                  </p>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      'gap-5',
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
      </main>

      <Footer />
    </div>
  );
}
