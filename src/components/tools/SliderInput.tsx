import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  formatValue?: (value: number) => string;
  showRange?: boolean;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = '',
  prefix = '',
  formatValue,
  showRange = false,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : `${prefix}${value.toLocaleString()}${suffix}`;

  const formatRangeValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <span className="text-sm font-semibold text-gold">{displayValue}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            min={min}
            max={max}
            step={step}
            className="flex-1"
          />
          {showRange && (
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              <span>{formatRangeValue(min)}</span>
              <span>{formatRangeValue(max)}</span>
            </div>
          )}
        </div>
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full sm:w-28 text-right tabular-nums h-12 sm:h-11",
            "bg-background/50 border-border/50",
            "focus:border-gold/50 focus:ring-1 focus:ring-gold/20",
            "transition-colors text-base sm:text-sm"
          )}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
}
