import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCalculatorAnalysis } from '@/hooks/useCalculatorAnalysis';

type CalculatorType = 'roi' | 'mortgage' | 'total-cost';

interface CalculatorAIAnalysisProps {
  calculatorType: CalculatorType;
  inputs: Record<string, any>;
  results: Record<string, any>;
  area?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonText?: string;
}

const calculatorTitles: Record<CalculatorType, string> = {
  'roi': 'ROI Analysis',
  'mortgage': 'Mortgage Analysis',
  'total-cost': 'Investment Analysis',
};

export function CalculatorAIAnalysis({
  calculatorType,
  inputs,
  results,
  area,
  buttonVariant = 'outline',
  buttonText = 'Get AI Analysis',
}: CalculatorAIAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { analysis, isAnalyzing, error, analyze, reset } = useCalculatorAnalysis({ calculatorType });

  const handleOpen = () => {
    setIsOpen(true);
    analyze(inputs, results, area);
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleRetry = () => {
    analyze(inputs, results, area);
  };

  // Format analysis text with basic markdown-like formatting
  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('###')) {
        return (
          <h4 key={i} className="font-heading text-base text-foreground mt-4 mb-2">
            {line.replace(/^###\s*/, '')}
          </h4>
        );
      }
      if (line.startsWith('##')) {
        return (
          <h3 key={i} className="font-heading text-lg text-foreground mt-4 mb-2">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
      }
      // Bold text with **
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-muted-foreground mb-2">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={i} className="text-muted-foreground ml-4 mb-1">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="text-muted-foreground ml-4 mb-1 list-decimal">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={i} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={i} className="text-muted-foreground mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={handleOpen}
        className="gap-2 border-primary/30 hover:bg-primary/10"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              AI {calculatorTitles[calculatorType]}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <AnimatePresence mode="wait">
              {isAnalyzing && !analysis && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing your calculations...</p>
                </motion.div>
              )}

              {error && !analysis && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-muted-foreground text-center">{error}</p>
                  <Button variant="outline" onClick={handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm max-w-none"
                >
                  {formatAnalysis(analysis)}
                  
                  {isAnalyzing && (
                    <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {analysis && !isAnalyzing && (
            <div className="pt-4 border-t border-border mt-4">
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate Analysis
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
