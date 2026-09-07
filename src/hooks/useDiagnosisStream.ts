import { useState, useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { API_BASE_URL } from "../services/diagnostics";
import { Diagnostico } from "../types";

export function useDiagnosisStream() {
  const [streamText, setStreamText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startAnalysis = useCallback(async (payload: Diagnostico) => {
    setIsLoading(true);
    setStreamText(""); // Clear previous text

    try {
      await fetchEventSource(`${API_BASE_URL}/diagnostics/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        async onopen(response) {
          if (response.ok) {
            return; // everything's good
          }
          let errorMsg = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errBody = await response.json();
            errorMsg = JSON.stringify(errBody);
          } catch { }
          setStreamText("Erro de comunicação: " + errorMsg);
          throw new Error(errorMsg); // Stop retries
        },
        onmessage(ev) {
          try {
            let payload = ev.data;
            if (payload.startsWith("data: ")) {
              payload = payload.replace(/^data:\s*/, "");
            }
            
            let data;
            try {
              data = JSON.parse(payload);
            } catch (err) {
              setStreamText("O backend retornou um erro mal formatado. Olhe o terminal do seu backend (Python) para ler a mensagem exata do Gemini.");
              throw err; // Stop retries
            }
            
            if (data.status === "error") {
              setStreamText("Erro retornado pela IA: " + data.message);
              throw new Error(data.message); // Throws to stop retries
            }
            if (data.text) {
              setStreamText((prev) => prev + data.text);
            }
          } catch (e) {
            console.error("Error parsing stream data", e);
            throw e; // Rethrow to trigger onerror and stop retries
          }
        },
        onerror(err) {
          console.error("Stream error", err);
          setIsLoading(false);
          throw err; // Stop retrying on error
        },
        onclose() {
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Failed to start analysis stream:", error);
      setIsLoading(false);
    }
  }, []);

  return {
    streamText,
    isLoading,
    startAnalysis,
  };
}
