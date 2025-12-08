import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : `${prefix}${value.toLocaleString()}${suffix}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-muted-foreground font-medium">{displayValue}</span>
      </div>
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 text-right"
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
}
