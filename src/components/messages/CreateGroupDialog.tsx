import { useState } from 'react';
import { Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConnections } from '@/hooks/useConnections';
import { useGroupMessages } from '@/hooks/useGroupMessages';
import { toast } from 'sonner';

interface CreateGroupDialogProps {
  children: React.ReactNode;
  onGroupCreated?: (groupId: string) => void;
}

interface AcceptedConnection {
  id: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
}

export function CreateGroupDialog({ children, onGroupCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const { acceptedConnections, acceptedLoading } = useConnections() as {
    acceptedConnections: AcceptedConnection[];
    acceptedLoading: boolean;
  };
  
  const { createGroup } = useGroupMessages();

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    try {
      const group = await createGroup.mutateAsync({
        name: groupName.trim(),
        memberIds: selectedMembers,
      });
      toast.success('Group created successfully');
      setOpen(false);
      setGroupName('');
      setSelectedMembers([]);
      onGroupCreated?.(group.id);
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription>
            Create a group chat with your connections
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Members ({selectedMembers.length} selected)</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {acceptedLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading connections...
                </p>
              ) : acceptedConnections?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No connections yet. Connect with members first.
                </p>
              ) : (
                <div className="space-y-2">
                  {acceptedConnections?.map((connection: AcceptedConnection) => {
                    const profile = connection.profile;
                    if (!profile) return null;
                    
                    return (
                      <label
                        key={profile.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedMembers.includes(profile.id)}
                          onCheckedChange={() => toggleMember(profile.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile.full_name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {profile.full_name || 'Unknown'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((memberId) => {
                const connection = acceptedConnections?.find(
                  (c: AcceptedConnection) => c.profile?.id === memberId
                );
                const profile = connection?.profile;
                if (!profile) return null;
                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                  >
                    <span>{profile.full_name}</span>
                    <button
                      onClick={() => toggleMember(memberId)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createGroup.isPending}
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
