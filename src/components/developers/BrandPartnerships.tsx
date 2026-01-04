import { motion } from 'framer-motion';
import { Handshake, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Json } from '@/integrations/supabase/types';

interface BrandPartnershipsProps {
  partnerships: Json;
  brandColor?: string;
}

export function BrandPartnerships({ partnerships, brandColor }: BrandPartnershipsProps) {
  // Parse partnerships - can be string array or JSON
  let partnershipList: string[] = [];
  
  if (Array.isArray(partnerships)) {
    partnershipList = partnerships as string[];
  } else if (typeof partnerships === 'string') {
    try {
      const parsed = JSON.parse(partnerships);
      if (Array.isArray(parsed)) {
        partnershipList = parsed;
      }
    } catch {
      partnershipList = [];
    }
  }

  if (partnershipList.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Handshake className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Brand Partnerships & Landmarks</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {partnershipList.map((partner, index) => (
          <motion.div
            key={partner}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Badge 
              variant="outline" 
              className="px-3 py-1.5 text-sm font-medium"
              style={{
                borderColor: brandColor ? `${brandColor}40` : undefined,
                backgroundColor: brandColor ? `${brandColor}08` : undefined,
              }}
            >
              <Award className="h-3 w-3 mr-1.5 text-amber-500" />
              {partner}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}