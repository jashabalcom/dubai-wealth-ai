import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectCard } from './ProjectCard';
import { useDeveloperProjects } from '@/hooks/useDevelopers';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectPortfolioProps {
  developerId: string;
}

const statusFilters = [
  { value: 'all', label: 'All Projects' },
  { value: 'iconic', label: 'Iconic' },
  { value: 'completed', label: 'Completed' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'upcoming', label: 'Upcoming' },
];

export function ProjectPortfolio({ developerId }: ProjectPortfolioProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: projects, isLoading } = useDeveloperProjects(developerId, statusFilter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          {statusFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="data-[state=active]:bg-gold data-[state=active]:text-primary-foreground px-4 py-2"
            >
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        {projects && projects.length > 0 ? (
          <motion.div
            key={statusFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Folder}
            title="No projects found"
            description="No projects match the selected filter. Try a different category."
            action={statusFilter !== 'all' ? { label: 'View All', onClick: () => setStatusFilter('all') } : undefined}
            className="py-12"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
