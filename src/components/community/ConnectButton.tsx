import { useState } from 'react';
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useConnections } from '@/hooks/useConnections';
import { cn } from '@/lib/utils';

interface ConnectButtonProps {
  userId: string;
  userName?: string;
  className?: string;
}

export function ConnectButton({ userId, userName, className }: ConnectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { 
    getConnectionStatus, 
    sendRequest, 
    cancelRequest, 
    acceptRequest,
    rejectRequest,
    removeConnection 
  } = useConnections();

  const connectionStatus = getConnectionStatus(userId);

  const handleSendRequest = async () => {
    await sendRequest.mutateAsync({ recipientId: userId, message: message || undefined });
    setMessage('');
    setIsOpen(false);
  };

  // Already connected
  if (connectionStatus?.status === 'accepted') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10', className)}
        onClick={() => removeConnection.mutate(connectionStatus.id)}
        disabled={removeConnection.isPending}
      >
        {removeConnection.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        Connected
      </Button>
    );
  }

  // Request pending - sent by current user
  if (connectionStatus?.status === 'pending' && connectionStatus.isSender) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2 text-amber-500 border-amber-500/30 hover:bg-amber-500/10', className)}
        onClick={() => cancelRequest.mutate(connectionStatus.id)}
        disabled={cancelRequest.isPending}
      >
        {cancelRequest.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        Pending
      </Button>
    );
  }

  // Request pending - received by current user
  if (connectionStatus?.status === 'pending' && connectionStatus.isReceiver) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Button
          size="sm"
          className="gap-2 bg-gold hover:bg-gold/90 text-background"
          onClick={() => acceptRequest.mutate(connectionStatus.id)}
          disabled={acceptRequest.isPending}
        >
          {acceptRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => rejectRequest.mutate(connectionStatus.id)}
          disabled={rejectRequest.isPending}
        >
          {rejectRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserX className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Request was rejected
  if (connectionStatus?.status === 'rejected') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2 text-muted-foreground', className)}
        disabled
      >
        <UserX className="h-4 w-4" />
        Unavailable
      </Button>
    );
  }

  // No connection - show Connect button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={cn('gap-2 bg-gold hover:bg-gold/90 text-background', className)}
        >
          <UserPlus className="h-4 w-4" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Connect with {userName || 'this member'}</DialogTitle>
          <DialogDescription>
            Send a connection request to start networking. Add an optional message to introduce yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Hi! I'd love to connect and discuss investment opportunities in Dubai..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] bg-muted/30"
          />
          <p className="text-xs text-muted-foreground mt-2">Optional message (max 500 characters)</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={sendRequest.isPending}
            className="bg-gold hover:bg-gold/90 text-background"
          >
            {sendRequest.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
