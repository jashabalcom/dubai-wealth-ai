/**
 * React hook for managing E2E encryption
 * Provides encryption/decryption functionality for messaging
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  generateKeyPair,
  exportKeyPair,
  importKeyPair,
  importPublicKey,
  encryptMessage,
  decryptMessage,
  isEncryptionSupported,
  type KeyPair,
  type EncryptedMessage,
} from '@/lib/encryption';
import {
  hasEncryptionKeys,
  cacheRecipientKey,
  getCachedRecipientKey,
  clearKeyCache,
} from '@/lib/keyManagement';

interface EncryptionState {
  isInitialized: boolean;
  isSupported: boolean;
  hasKeys: boolean;
  publicKey: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseEncryptionReturn extends EncryptionState {
  initializeEncryption: () => Promise<void>;
  encrypt: (plaintext: string, recipientId: string) => Promise<EncryptedMessage | null>;
  decrypt: (encrypted: EncryptedMessage) => Promise<string | null>;
  getRecipientPublicKey: (userId: string) => Promise<string | null>;
  refreshKeys: () => Promise<void>;
}

// In-memory key storage (cleared on page refresh for security)
let userKeyPair: KeyPair | null = null;
let userPublicKeyExported: string | null = null;

export function useEncryption(): UseEncryptionReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const initializingRef = useRef(false);

  const [state, setState] = useState<EncryptionState>({
    isInitialized: false,
    isSupported: isEncryptionSupported(),
    hasKeys: false,
    publicKey: null,
    isLoading: true,
    error: null,
  });

  // Public key cache for recipients
  const publicKeyCache = useRef<Map<string, string>>(new Map());

  /**
   * Initialize or load encryption keys
   */
  const initializeEncryption = useCallback(async () => {
    if (!user?.id || initializingRef.current) return;
    if (!isEncryptionSupported()) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Your browser does not support encryption',
      }));
      return;
    }

    initializingRef.current = true;

    try {
      // Check if user already has a public key in the database
      const { data: profile } = await supabase
        .from('profiles')
        .select('public_key')
        .eq('id', user.id)
        .single();

      if (profile?.public_key) {
        // User has keys, try to regenerate (in production, would load from secure storage)
        // For now, we regenerate session keys
        const keyPair = await generateKeyPair();
        const exported = await exportKeyPair(keyPair);

        userKeyPair = keyPair;
        userPublicKeyExported = exported.publicKey;

        // Update public key in database (session key)
        await supabase
          .from('profiles')
          .update({ public_key: exported.publicKey })
          .eq('id', user.id);

        setState({
          isInitialized: true,
          isSupported: true,
          hasKeys: true,
          publicKey: exported.publicKey,
          isLoading: false,
          error: null,
        });
      } else {
        // First time setup - generate new keys
        const keyPair = await generateKeyPair();
        const exported = await exportKeyPair(keyPair);

        userKeyPair = keyPair;
        userPublicKeyExported = exported.publicKey;

        // Store public key in database
        await supabase
          .from('profiles')
          .update({ public_key: exported.publicKey })
          .eq('id', user.id);

        setState({
          isInitialized: true,
          isSupported: true,
          hasKeys: true,
          publicKey: exported.publicKey,
          isLoading: false,
          error: null,
        });

        toast({
          title: 'Encryption Enabled',
          description: 'Your messages are now end-to-end encrypted.',
        });
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize encryption',
      }));
    } finally {
      initializingRef.current = false;
    }
  }, [user?.id, toast]);

  /**
   * Get recipient's public key from database
   */
  const getRecipientPublicKey = useCallback(async (userId: string): Promise<string | null> => {
    // Check cache first
    const cached = publicKeyCache.current.get(userId);
    if (cached) return cached;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('public_key')
        .eq('id', userId)
        .single();

      if (data?.public_key) {
        publicKeyCache.current.set(userId, data.public_key);
        return data.public_key;
      }

      return null;
    } catch {
      console.error('Failed to get recipient public key');
      return null;
    }
  }, []);

  /**
   * Encrypt a message for a recipient
   */
  const encrypt = useCallback(async (
    plaintext: string,
    recipientId: string
  ): Promise<EncryptedMessage | null> => {
    if (!userKeyPair) {
      console.error('Encryption not initialized');
      return null;
    }

    try {
      const recipientPublicKey = await getRecipientPublicKey(recipientId);

      if (!recipientPublicKey) {
        // Recipient doesn't have encryption set up, return null to fall back to plaintext
        console.warn('Recipient does not have encryption keys');
        return null;
      }

      const encrypted = await encryptMessage(
        plaintext,
        recipientPublicKey,
        userKeyPair.privateKey
      );

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }, [getRecipientPublicKey]);

  /**
   * Decrypt a received message
   */
  const decrypt = useCallback(async (
    encrypted: EncryptedMessage
  ): Promise<string | null> => {
    if (!userKeyPair) {
      console.error('Encryption not initialized');
      return null;
    }

    try {
      const plaintext = await decryptMessage(encrypted, userKeyPair.privateKey);
      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }, []);

  /**
   * Refresh encryption keys (regenerate)
   */
  const refreshKeys = useCallback(async () => {
    userKeyPair = null;
    userPublicKeyExported = null;
    publicKeyCache.current.clear();
    clearKeyCache();

    setState({
      isInitialized: false,
      isSupported: isEncryptionSupported(),
      hasKeys: false,
      publicKey: null,
      isLoading: true,
      error: null,
    });

    await initializeEncryption();
  }, [initializeEncryption]);

  // Initialize on mount
  useEffect(() => {
    if (user?.id && !state.isInitialized && !initializingRef.current) {
      initializeEncryption();
    }
  }, [user?.id, state.isInitialized, initializeEncryption]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear keys on unmount - keep for session
    };
  }, []);

  return {
    ...state,
    initializeEncryption,
    encrypt,
    decrypt,
    getRecipientPublicKey,
    refreshKeys,
  };
}

/**
 * Hook for checking if a user has encryption enabled
 */
export function useRecipientEncryption(recipientId: string | undefined) {
  const [hasEncryption, setHasEncryption] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!recipientId) {
      setHasEncryption(null);
      setIsLoading(false);
      return;
    }

    const checkEncryption = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('public_key')
          .eq('id', recipientId)
          .single();

        setHasEncryption(!!data?.public_key);
      } catch {
        setHasEncryption(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEncryption();
  }, [recipientId]);

  return { hasEncryption, isLoading };
}

export default useEncryption;
