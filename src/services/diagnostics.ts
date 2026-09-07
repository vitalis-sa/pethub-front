import { Diagnostico } from "../types";

export const API_BASE_URL = "http://localhost:8000/api";

export async function extractSymptoms(transcript: string): Promise<Diagnostico> {
  const response = await fetch(`${API_BASE_URL}/diagnostics/extract-symptoms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    throw new Error(`Failed to extract symptoms: ${response.statusText}`);
  }

  return response.json();
}
