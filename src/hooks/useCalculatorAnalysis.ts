import { useState, useCallback } from 'react';

type CalculatorType = 'roi' | 'mortgage' | 'total-cost';

interface UseCalculatorAnalysisProps {
  calculatorType: CalculatorType;
}

export function useCalculatorAnalysis({ calculatorType }: UseCalculatorAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (inputs: Record<string, any>, results: Record<string, any>, area?: string) => {
    setIsAnalyzing(true);
    setAnalysis('');
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-calculator-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ calculatorType, inputs, results, area }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setAnalysis(fullResponse);
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Calculator analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculatorType]);

  const reset = useCallback(() => {
    setAnalysis('');
    setError(null);
  }, []);

  return { analysis, isAnalyzing, error, analyze, reset };
}
