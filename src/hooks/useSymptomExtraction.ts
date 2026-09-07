import { useState, useEffect } from "react";
import { Diagnostico } from "../types";
import { extractSymptoms } from "../services/diagnostics";

export function useSymptomExtraction(transcript: string, debounceMs: number = 2000) {
  const [extractedData, setExtractedData] = useState<Diagnostico | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (!transcript.trim()) return;

    const handler = setTimeout(async () => {
      try {
        setIsExtracting(true);
        const data = await extractSymptoms(transcript);
        setExtractedData(data);
      } catch (error) {
        console.error("Failed to extract symptoms:", error);
      } finally {
        setIsExtracting(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [transcript, debounceMs]);

  return {
    extractedData,
    isExtracting,
    setExtractedData, // allow manual overrides
  };
}
