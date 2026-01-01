import { useState } from 'react';
import { UserPlus, UserCheck, UserX, Clock, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  size?: 'sm' | 'default';
}

export function ConnectButton({ userId, userName, className, size = 'sm' }: ConnectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
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
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const buttonBaseClasses = cn(
    'relative overflow-hidden font-medium transition-all duration-300',
    size === 'sm' ? 'h-9 text-sm' : 'h-10',
    className
  );

  // Already connected
  if (connectionStatus?.status === 'accepted') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(
          buttonBaseClasses,
          'gap-2 text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
          'hover:bg-emerald-500/10 hover:border-emerald-500/50'
        )}
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
        size={size}
        className={cn(
          buttonBaseClasses,
          'gap-2 text-amber-500 border-amber-500/30 bg-amber-500/5',
          'hover:bg-amber-500/10 hover:border-amber-500/50'
        )}
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
          size={size}
          className={cn(
            'flex-1 gap-2',
            'bg-gradient-to-r from-gold to-gold/90 text-secondary',
            'hover:from-gold hover:to-gold/80 hover:shadow-lg hover:shadow-gold/25',
            'transition-all duration-300'
          )}
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
          size={size}
          className="border-border/50 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
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
        size={size}
        className={cn(buttonBaseClasses, 'gap-2 text-muted-foreground cursor-not-allowed')}
        disabled
      >
        <UserX className="h-4 w-4" />
        Unavailable
      </Button>
    );
  }

  // No connection - show premium Connect button
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div className={cn('relative', className)} whileTap={{ scale: 0.98 }}>
            <Button
              size={size}
              className={cn(
                buttonBaseClasses,
                'w-full gap-2',
                'bg-gradient-to-r from-gold via-gold to-gold/90 text-secondary font-semibold',
                'hover:from-gold hover:via-gold/95 hover:to-gold/85',
                'hover:shadow-lg hover:shadow-gold/30',
                'active:shadow-md',
                'group'
              )}
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </span>
              <UserPlus className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Connect</span>
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Connect with {userName || 'this member'}</DialogTitle>
            <DialogDescription>
              Send a connection request to start networking. Add an optional message to introduce yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Hi! I'd love to connect and discuss investment opportunities in Dubai..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] bg-muted/30 border-border/50 focus:border-gold/50"
            />
            <p className="text-xs text-muted-foreground mt-2">Optional message (max 500 characters)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-border/50">
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={sendRequest.isPending}
              className="bg-gradient-to-r from-gold to-gold/90 text-secondary hover:from-gold hover:to-gold/80 gap-2"
            >
              {sendRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card border border-gold/30 rounded-2xl p-8 shadow-2xl shadow-gold/20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center"
              >
                <Sparkles className="h-8 w-8 text-secondary" />
              </motion.div>
              <h3 className="font-serif text-xl font-semibold mb-2">Request Sent!</h3>
              <p className="text-muted-foreground text-sm">Your connection request has been sent to {userName}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}