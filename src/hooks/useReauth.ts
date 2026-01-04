import { useState, useCallback } from 'react';

/**
 * Hook to manage re-authentication state for sensitive operations
 * 
 * Usage:
 * const { requireReauth, ReauthGate, isReauthOpen } = useReauth();
 * 
 * const handleSensitiveAction = () => {
 *   requireReauth('delete your account', () => {
 *     // This runs after successful re-auth
 *     performDeletion();
 *   });
 * };
 */
export function useReauth() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionDescription, setActionDescription] = useState('');
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  const requireReauth = useCallback((description: string, onSuccess: () => void) => {
    setActionDescription(description);
    setOnSuccessCallback(() => onSuccess);
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    if (onSuccessCallback) {
      onSuccessCallback();
    }
    setIsOpen(false);
    setOnSuccessCallback(null);
  }, [onSuccessCallback]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setOnSuccessCallback(null);
    }
  }, []);

  return {
    requireReauth,
    isReauthOpen: isOpen,
    reauthProps: {
      open: isOpen,
      onOpenChange: handleOpenChange,
      onSuccess: handleSuccess,
      actionDescription,
    },
  };
}
