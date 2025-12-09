import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardInsights } from '@/hooks/useDashboardInsights';

export function AIInsightsCard() {
  const { insights, isLoading, error, fetchInsights, reset } = useDashboardInsights();

  // Auto-fetch on mount
  useEffect(() => {
    fetchInsights();
  }, []);

  // Format insights with markdown-like styling
  const formatInsights = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('###')) {
        return (
          <h4 key={i} className="font-heading text-sm text-foreground mt-3 mb-1">
            {line.replace(/^###\s*/, '')}
          </h4>
        );
      }
      if (line.startsWith('##')) {
        return (
          <h3 key={i} className="font-heading text-base text-foreground mt-3 mb-1">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
      }
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-muted-foreground text-sm mb-1.5">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={i} className="text-muted-foreground text-sm ml-3 mb-1.5 list-disc">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="text-muted-foreground text-sm ml-3 mb-1.5 list-decimal">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={i} className="h-1.5" />;
      }
      // Regular text
      return (
        <p key={i} className="text-muted-foreground text-sm mb-1.5">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg text-foreground">Weekly AI Insights</h2>
            <p className="text-xs text-muted-foreground">Personalized for you</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && !insights && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your investments...</p>
          </motion.div>
        )}

        {error && !insights && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchInsights}>
              Try Again
            </Button>
          </motion.div>
        )}

        {insights && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[400px] overflow-y-auto pr-2"
          >
            <ul className="space-y-0.5">
              {formatInsights(insights)}
            </ul>
            
            {isLoading && (
              <span className="inline-block w-1.5 h-3 bg-primary/50 animate-pulse ml-0.5" />
            )}
          </motion.div>
        )}

        {!isLoading && !error && !insights && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click refresh to generate personalized insights
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
