import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

const ANALYSIS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-property-analysis`;

export function usePropertyAnalysis() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProperty = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis("");

    let analysisSoFar = "";

    const appendAnalysis = (chunk: string) => {
      analysisSoFar += chunk;
      setAnalysis(analysisSoFar);
    };

    try {
      const resp = await fetch(ANALYSIS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          propertyId,
          userId: user?.id
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) appendAnalysis(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) appendAnalysis(content);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Property analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze property");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const clearAnalysis = useCallback(() => {
    setAnalysis("");
    setError(null);
  }, []);

  return { analysis, isLoading, error, analyzeProperty, clearAnalysis };
}
