import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MetricSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
}

export function MetricSparkline({ 
  data, 
  color = 'hsl(var(--gold))', 
  height = 24,
  width = 80,
  showDots = false,
}: MetricSparklineProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    // Create smooth curve using bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [data, height, width]);

  const lastPoint = useMemo(() => {
    if (data.length < 1) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const lastValue = data[data.length - 1];
    return {
      x: width,
      y: height - ((lastValue - min) / range) * height,
    };
  }, [data, height, width]);

  const trend = useMemo(() => {
    if (data.length < 2) return 'neutral';
    return data[data.length - 1] >= data[0] ? 'up' : 'down';
  }, [data]);

  const strokeColor = trend === 'up' ? 'hsl(var(--emerald-500, 142 76% 36%))' : trend === 'down' ? 'hsl(var(--destructive))' : color;

  if (data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {showDots && lastPoint && (
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3}
          fill={strokeColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
      )}
    </svg>
  );
}
