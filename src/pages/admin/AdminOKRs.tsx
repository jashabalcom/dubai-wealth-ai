import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target } from 'lucide-react';
import { useOKRs } from '@/hooks/useOKRs';
import { OKRStatsCards } from '@/components/admin/okr/OKRStatsCards';
import { OKRObjectiveCard } from '@/components/admin/okr/OKRObjectiveCard';
import { AddObjectiveDialog } from '@/components/admin/okr/AddObjectiveDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOKRs() {
  const [showAddObjective, setShowAddObjective] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'archived'>('active');

  const {
    objectives,
    isLoading,
    stats,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    recordProgress,
  } = useOKRs();

  const filteredObjectives = objectives?.filter(o => o.status === statusFilter) || [];

  return (
    <AdminLayout title="OKRs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Track objectives and key results for Dubai Wealth Hub</p>
          <Button onClick={() => setShowAddObjective(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <OKRStatsCards stats={stats} />
        )}

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : filteredObjectives.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No {statusFilter} objectives</h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'active' 
                    ? 'Create your first objective to start tracking progress.'
                    : `No objectives have been ${statusFilter} yet.`
                  }
                </p>
                {statusFilter === 'active' && (
                  <Button onClick={() => setShowAddObjective(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Objective
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredObjectives.map((objective) => (
                  <OKRObjectiveCard
                    key={objective.id}
                    objective={objective}
                    onUpdate={(id, data) => updateObjective.mutate({ id, ...data })}
                    onDelete={(id) => deleteObjective.mutate(id)}
                    onAddKeyResult={(data) => createKeyResult.mutate(data)}
                    onUpdateKeyResult={(data) => updateKeyResult.mutate(data)}
                    onDeleteKeyResult={(id) => deleteKeyResult.mutate(id)}
                    onRecordProgress={(data) => recordProgress.mutate(data)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddObjectiveDialog
        open={showAddObjective}
        onOpenChange={setShowAddObjective}
        onSubmit={(data) => createObjective.mutate(data)}
      />
    </AdminLayout>
  );
}
