/**
 * Luxury chart theme configuration for Recharts
 * Provides consistent styling across all data visualizations
 */

// Color palette for charts - uses CSS variables
export const chartColors = {
  primary: 'hsl(35 25% 70%)',        // Gold
  primaryLight: 'hsl(40 30% 80%)',   // Light gold
  secondary: 'hsl(220 40% 8%)',      // Navy
  secondaryLight: 'hsl(220 35% 15%)', // Light navy
  success: 'hsl(142 76% 36%)',       // Green
  warning: 'hsl(38 92% 50%)',        // Amber
  danger: 'hsl(0 84% 60%)',          // Red
  muted: 'hsl(220 20% 45%)',         // Muted text
  background: 'hsl(0 0% 100%)',      // White
  grid: 'hsl(220 20% 90%)',          // Grid lines
};

// Multi-series color palette
export const seriesColors = [
  'hsl(35 25% 70%)',   // Gold
  'hsl(220 60% 50%)',  // Blue
  'hsl(142 76% 36%)',  // Green
  'hsl(271 91% 65%)',  // Purple
  'hsl(38 92% 50%)',   // Amber
  'hsl(199 89% 48%)',  // Sky
  'hsl(328 85% 46%)',  // Pink
  'hsl(24 95% 53%)',   // Orange
];

// Gradient definitions for area charts
export const chartGradients = {
  goldGradient: {
    id: 'goldGradient',
    stops: [
      { offset: '0%', color: 'hsl(35 25% 70%)', opacity: 0.8 },
      { offset: '100%', color: 'hsl(35 25% 70%)', opacity: 0.1 },
    ],
  },
  navyGradient: {
    id: 'navyGradient',
    stops: [
      { offset: '0%', color: 'hsl(220 60% 50%)', opacity: 0.8 },
      { offset: '100%', color: 'hsl(220 60% 50%)', opacity: 0.1 },
    ],
  },
  successGradient: {
    id: 'successGradient',
    stops: [
      { offset: '0%', color: 'hsl(142 76% 36%)', opacity: 0.8 },
      { offset: '100%', color: 'hsl(142 76% 36%)', opacity: 0.1 },
    ],
  },
};

// Tooltip styling
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(220 40% 8%)',
    border: '1px solid hsl(35 25% 70% / 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 25px 50px -12px hsl(220 40% 8% / 0.25)',
  },
  labelStyle: {
    color: 'hsl(40 20% 92%)',
    fontWeight: 600,
    marginBottom: '8px',
    fontFamily: 'Inter, sans-serif',
  },
  itemStyle: {
    color: 'hsl(40 20% 92%)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
  },
};

// Axis styling
export const axisStyle = {
  tick: {
    fill: 'hsl(220 20% 45%)',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  },
  axisLine: {
    stroke: 'hsl(220 20% 85%)',
    strokeWidth: 1,
  },
  tickLine: {
    stroke: 'hsl(220 20% 85%)',
    strokeWidth: 1,
  },
};

// Grid styling
export const gridStyle = {
  stroke: 'hsl(220 20% 90%)',
  strokeDasharray: '3 3',
  strokeOpacity: 0.6,
};

// Legend styling
export const legendStyle = {
  wrapperStyle: {
    paddingTop: '20px',
  },
  iconType: 'circle' as const,
  iconSize: 8,
  formatter: (value: string) => (
    `<span style="color: hsl(220 40% 8%); font-size: 13px; font-family: Inter, sans-serif;">${value}</span>`
  ),
};

// Animation configuration
export const animationConfig = {
  duration: 800,
  easing: 'ease-out',
  delay: 100,
};

// Responsive breakpoints for chart sizing
export const chartBreakpoints = {
  sm: { width: '100%', height: 250 },
  md: { width: '100%', height: 300 },
  lg: { width: '100%', height: 400 },
};

// Pre-configured chart props
export const areaChartProps = {
  margin: { top: 20, right: 30, left: 0, bottom: 5 },
  style: { fontFamily: 'Inter, sans-serif' },
};

export const barChartProps = {
  margin: { top: 20, right: 30, left: 0, bottom: 5 },
  barGap: 4,
  barCategoryGap: '20%',
  style: { fontFamily: 'Inter, sans-serif' },
};

export const pieChartProps = {
  innerRadius: '60%',
  outerRadius: '80%',
  paddingAngle: 3,
  cornerRadius: 6,
  style: { fontFamily: 'Inter, sans-serif' },
};

// Helper function to format large numbers
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Helper function to format currency
export const formatCurrency = (value: number, currency = 'AED'): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Custom label component for pie charts
export const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) => {
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

// Custom active shape for pie charts with hover effect
export const activeShapeStyle = {
  fill: 'hsl(35 25% 60%)',
  stroke: 'hsl(35 25% 50%)',
  strokeWidth: 2,
};

// Dot styling for line/area charts
export const dotStyle = {
  r: 4,
  fill: 'hsl(35 25% 70%)',
  stroke: 'hsl(0 0% 100%)',
  strokeWidth: 2,
};

export const activeDotStyle = {
  r: 6,
  fill: 'hsl(35 25% 60%)',
  stroke: 'hsl(0 0% 100%)',
  strokeWidth: 3,
  style: {
    filter: 'drop-shadow(0 0 8px hsl(35 25% 70% / 0.5))',
  },
};

// Reference line styling
export const referenceLineStyle = {
  stroke: 'hsl(35 25% 70%)',
  strokeDasharray: '5 5',
  strokeWidth: 1,
  label: {
    fill: 'hsl(220 40% 8%)',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
  },
};

// Brush styling for zoomable charts
export const brushStyle = {
  dataKey: 'value',
  height: 30,
  stroke: 'hsl(35 25% 70%)',
  fill: 'hsl(35 25% 70% / 0.1)',
};

export default {
  chartColors,
  seriesColors,
  chartGradients,
  tooltipStyle,
  axisStyle,
  gridStyle,
  legendStyle,
  animationConfig,
  areaChartProps,
  barChartProps,
  pieChartProps,
  formatNumber,
  formatCurrency,
  formatPercentage,
};
