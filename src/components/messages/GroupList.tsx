import { Users, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GroupChat } from '@/hooks/useGroupMessages';
import { CreateGroupDialog } from './CreateGroupDialog';
import { formatDistanceToNow } from 'date-fns';

interface GroupListProps {
  groups: GroupChat[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  isLoading: boolean;
  onGroupCreated?: (groupId: string) => void;
}

export function GroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  isLoading,
  onGroupCreated,
}: GroupListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading groups...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <CreateGroupDialog onGroupCreated={onGroupCreated}>
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </CreateGroupDialog>
      </div>
      
      <ScrollArea className="flex-1">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No group chats yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedGroupId === group.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={group.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{group.name}</p>
                    {group.last_message && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(group.last_message.created_at), {
                          addSuffix: false,
                        })}
                      </span>
                    )}
                  </div>
                  {group.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {group.last_message.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
