import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Building2, Check, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { FreeZoneInfo } from '@/lib/commercialRealEstateFees';

interface FreeZoneCardProps {
  zone: FreeZoneInfo;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  disabled?: boolean;
}

export function FreeZoneCard({ zone, isSelected, onSelect, disabled }: FreeZoneCardProps) {
  return (
    <motion.div
      whileHover={!disabled ? { y: -4 } : undefined}
      className={cn(
        "relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
        isSelected 
          ? "border-gold bg-gold/5 shadow-lg shadow-gold/10" 
          : "border-border bg-card hover:border-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && onSelect(!isSelected)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 right-4">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => !disabled && onSelect(!!checked)}
          disabled={disabled}
          className={cn(
            "h-5 w-5",
            isSelected && "border-gold data-[state=checked]:bg-gold data-[state=checked]:text-primary-foreground"
          )}
        />
      </div>

      {/* Header */}
      <div className="pr-8 mb-3">
        <h3 className="font-heading text-lg text-foreground mb-1">{zone.name}</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{zone.location}</span>
        </div>
      </div>

      {/* Sector badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {zone.sector.slice(0, 3).map((sector) => (
          <Badge 
            key={sector} 
            variant="outline" 
            className="text-xs px-2 py-0.5 bg-secondary/50"
          >
            {sector}
          </Badge>
        ))}
        {zone.sector.length > 3 && (
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-secondary/50">
            +{zone.sector.length - 3}
          </Badge>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">License From</p>
            <p className="text-sm font-semibold text-foreground">
              AED {zone.licenseCost.from.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Visas</p>
            <p className="text-sm font-semibold text-foreground">
              {zone.visaAllocation.min}-{zone.visaAllocation.max}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Setup Time</p>
            <p className="text-sm font-semibold text-foreground">
              {zone.setupTimeWeeks} week{zone.setupTimeWeeks > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tax</p>
            <p className="text-sm font-semibold text-emerald-500">
              {zone.corporateTax}% Corp
            </p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-1.5 mb-4">
        {zone.highlights.slice(0, 2).map((highlight, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-muted-foreground line-clamp-1">{highlight}</span>
          </div>
        ))}
      </div>

      {/* Website link */}
      <a
        href={zone.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        <span>Official Website</span>
      </a>
    </motion.div>
  );
}
