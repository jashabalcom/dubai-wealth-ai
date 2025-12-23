import { useState } from 'react';
import { Eye, EyeOff, Trash2, UserPlus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Agent {
  id: string;
  full_name: string;
}

interface PropertyBulkActionsProps {
  selectedCount: number;
  totalOnPage: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkDelete: () => void;
  onBulkAssignAgent: (agentId: string | null) => void;
  agents: Agent[];
  isLoading?: boolean;
}

export function PropertyBulkActions({
  selectedCount,
  totalOnPage,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onBulkPublish,
  onBulkUnpublish,
  onBulkDelete,
  onBulkAssignAgent,
  agents,
  isLoading,
}: PropertyBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignAgent, setShowAssignAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const handleAssignAgent = () => {
    onBulkAssignAgent(selectedAgentId || null);
    setShowAssignAgent(false);
    setSelectedAgentId('');
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected && totalOnPage > 0}
              onCheckedChange={(checked) => checked ? onSelectAll() : onClearSelection()}
              disabled={totalOnPage === 0}
            />
            <span className="text-sm text-muted-foreground">
              {selectedCount > 0 
                ? `${selectedCount} selected` 
                : `Select all (${totalOnPage})`
              }
            </span>
          </div>

          {selectedCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBulkPublish}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-1" />
              Publish
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBulkUnpublish}
              disabled={isLoading}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Unpublish
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowAssignAgent(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Agent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Properties?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected properties including all associated images and floor plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBulkDelete();
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedCount} Properties
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Agent Dialog */}
      <Dialog open={showAssignAgent} onOpenChange={setShowAssignAgent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent to {selectedCount} Properties</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Remove Agent</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignAgent(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignAgent} className="bg-gold hover:bg-gold/90 text-background">
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
