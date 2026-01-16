import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecureFieldRevealProps {
  recordId: string;
  maskedValue: string | null;
  fieldType: 'email' | 'phone' | 'paypal' | 'bank_details' | 'income' | 'budget';
  rpcFunction: string;
  rpcParams?: Record<string, unknown>;
  autoHideSeconds?: number;
  className?: string;
}

export function SecureFieldReveal({
  recordId,
  maskedValue,
  fieldType,
  rpcFunction,
  rpcParams = {},
  autoHideSeconds = 30,
  className = '',
}: SecureFieldRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);

  const handleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedValue(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(rpcFunction as any, {
        ...rpcParams,
        [getParamName(rpcFunction)]: recordId,
      });

      if (error) {
        console.error('Decryption error:', error);
        toast.error('Failed to reveal field. Access denied or data not encrypted.');
        return;
      }

      // Handle different return types (single value vs table row)
      let value: string | null = null;
      if (data === null || data === undefined) {
        toast.info('No encrypted data found for this field.');
        return;
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // Table function returns array
        const row = data[0] as Record<string, unknown>;
        value = (row[fieldType] as string) || (row.email as string) || (row.phone as string) || null;
      } else if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        value = (obj[fieldType] as string) || (obj.email as string) || (obj.phone as string) || null;
      } else {
        value = data as string;
      }

      if (!value) {
        toast.info('No encrypted data found for this field.');
        return;
      }

      setDecryptedValue(value);
      setIsRevealed(true);

      // Auto-hide after specified seconds
      if (autoHideSeconds > 0) {
        setTimeout(() => {
          setIsRevealed(false);
          setDecryptedValue(null);
        }, autoHideSeconds * 1000);
      }

      toast.success('Field revealed. Access logged.', {
        description: `Will auto-hide in ${autoHideSeconds}s`,
      });
    } catch (err) {
      console.error('Reveal error:', err);
      toast.error('Failed to reveal encrypted data');
    } finally {
      setIsLoading(false);
    }
  };

  const getParamName = (fnName: string): string => {
    const paramMap: Record<string, string> = {
      get_decrypted_profile_email: 'profile_id',
      get_decrypted_profile_phone: 'profile_id',
      get_decrypted_mortgage_lead_contact: 'lead_id',
      get_decrypted_inquiry_contact: 'inquiry_id',
      get_decrypted_golden_visa_contact: 'submission_id',
      get_decrypted_affiliate_paypal: 'affiliate_id',
      get_decrypted_affiliate_bank_details: 'affiliate_id',
    };
    return paramMap[fnName] || 'id';
  };

  const displayValue = isRevealed && decryptedValue ? decryptedValue : maskedValue;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${isRevealed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
        {displayValue || '-'}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleReveal}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isRevealed ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {isRevealed ? 'Hide (access logged)' : 'Reveal encrypted data'}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// Batch reveal component for dialog detail views
interface SecureContactRevealProps {
  recordId: string;
  rpcFunction: string;
  fields: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export function SecureContactReveal({ recordId, rpcFunction, fields }: SecureContactRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Record<string, string | null>>({});

  const handleRevealAll = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedData({});
      return;
    }

    setIsLoading(true);
    try {
      const paramName = rpcFunction.includes('profile') ? 'profile_id' 
        : rpcFunction.includes('mortgage') ? 'lead_id'
        : rpcFunction.includes('inquiry') ? 'inquiry_id'
        : rpcFunction.includes('golden_visa') ? 'submission_id'
        : rpcFunction.includes('affiliate') ? 'affiliate_id'
        : 'id';

      const { data, error } = await supabase.rpc(rpcFunction as any, {
        [paramName]: recordId,
      });

      if (error) {
        console.error('Decryption error:', error);
        toast.error('Failed to reveal contact info');
        return;
      }

      const result = Array.isArray(data) && data.length > 0 ? data[0] : data;
      if (!result) {
        toast.info('No encrypted data found');
        return;
      }

      setDecryptedData(result);
      setIsRevealed(true);

      toast.success('Contact info revealed. Access logged.', {
        description: 'Will auto-hide in 60s',
      });

      setTimeout(() => {
        setIsRevealed(false);
        setDecryptedData({});
      }, 60000);
    } catch (err) {
      console.error('Reveal error:', err);
      toast.error('Failed to reveal encrypted data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevealAll}
        disabled={isLoading}
        className="mb-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isRevealed ? (
          <EyeOff className="h-4 w-4 mr-2" />
        ) : (
          <Eye className="h-4 w-4 mr-2" />
        )}
        {isRevealed ? 'Hide Contact Info' : 'Reveal Contact Info'}
        <Shield className="h-3 w-3 ml-2 text-muted-foreground" />
      </Button>

      {fields.map((field) => (
        <div key={field.key} className="flex items-center gap-2 text-sm">
          {field.icon}
          <span className="text-muted-foreground">{field.label}:</span>
          <span className={isRevealed ? 'text-emerald-500' : ''}>
            {isRevealed && decryptedData[field.key] 
              ? decryptedData[field.key] 
              : '***encrypted***'}
          </span>
        </div>
      ))}
    </div>
  );
}
