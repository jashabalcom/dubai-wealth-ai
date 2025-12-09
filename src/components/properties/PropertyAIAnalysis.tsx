import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePropertyAnalysis } from "@/hooks/usePropertyAnalysis";
import { Bot, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface PropertyAIAnalysisProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyAIAnalysis({ propertyId, propertyTitle, isOpen, onClose }: PropertyAIAnalysisProps) {
  const { analysis, isLoading, error, analyzeProperty, clearAnalysis } = usePropertyAnalysis();

  useEffect(() => {
    if (isOpen && !analysis && !isLoading) {
      analyzeProperty(propertyId);
    }
  }, [isOpen, propertyId, analysis, isLoading, analyzeProperty]);

  const handleClose = () => {
    clearAnalysis();
    onClose();
  };

  const handleRetry = () => {
    clearAnalysis();
    analyzeProperty(propertyId);
  };

  // Simple markdown-like formatting
  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-heading text-foreground mt-6 mb-3">{line.slice(3)}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-base font-medium text-foreground mt-4 mb-2">{line.slice(4)}</h4>;
      }
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-foreground mt-2">{line.slice(2, -2)}</p>;
      }
      // Bullet points
      if (line.startsWith('- ')) {
        const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <li key={i} className="text-muted-foreground ml-4 mb-1" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p key={i} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }
      // Regular text
      if (line.trim()) {
        const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p key={i} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }
      return null;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            AI Investment Analysis
          </DialogTitle>
          <DialogDescription>
            {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            ) : isLoading && !analysis ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
                <p className="text-muted-foreground">Analyzing property data...</p>
                <p className="text-xs text-muted-foreground mt-2">Comparing with area statistics and calculating metrics</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1 pb-4"
              >
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <Bot className="w-5 h-5 text-gold" />
                  <span className="text-sm font-medium text-gold">AI Analysis</span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formatAnalysis(analysis)}
                </div>
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-gold/50 animate-pulse ml-1" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            AI analysis is for informational purposes only. Always conduct your own due diligence and consult with licensed professionals.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
