import { Pet, Tutor, Vet, Teleconsulta, Diagnostico } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      let message = response.statusText;
      try {
        const errorData = await response.json();
        message = errorData.detail || errorData.message || message;
      } catch {}
      throw new Error(`Erro na API (${response.status}): ${message}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Timeout: O servidor demorou muito para responder.");
    }
    throw error;
  }
}

// ========================
// Veterinários
// ========================
export const createVet = (data: Partial<Vet>) => fetchApi<Vet>("/vets", { method: "POST", body: JSON.stringify(data) });
export const getVets = () => fetchApi<Vet[]>("/vets");
export const getVet = (id: string) => fetchApi<Vet>(`/vets/${id}`);
export const updateVet = (id: string, data: Partial<Vet>) => fetchApi<Vet>(`/vets/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVet = (id: string) => fetchApi<void>(`/vets/${id}`, { method: "DELETE" });

// ========================
// Tutores (O swagger define /api/tutors)
// ========================
export const getTutores = () => fetchApi<Tutor[]>("/tutors");
export const getTutor = (id: string) => fetchApi<Tutor>(`/tutors/${id}`);
export const createTutor = (data: Partial<Tutor>) => fetchApi<Tutor>("/tutors", { method: "POST", body: JSON.stringify(data) });
export const updateTutor = (id: string, data: Partial<Tutor>) => fetchApi<Tutor>(`/tutors/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTutor = (id: string) => fetchApi<void>(`/tutors/${id}`, { method: "DELETE" });

// ========================
// Pets (O swagger define /api/pets)
// ========================
export const getPets = () => fetchApi<Pet[]>("/pets");
export const getPet = (id: string) => fetchApi<Pet>(`/pets/${id}`);
export const createPet = (data: Partial<Pet>) => fetchApi<Pet>("/pets", { method: "POST", body: JSON.stringify(data) });
export const updatePet = (id: string, data: Partial<Pet>) => fetchApi<Pet>(`/pets/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePet = (id: string) => fetchApi<void>(`/pets/${id}`, { method: "DELETE" });
export const deleteDiagnostic = (petId: string, diagId: string) => fetchApi<void>(`/pets/${petId}/diagnostics/${diagId}`, { method: "DELETE" });

// ========================
// Teleconsultas
// ========================
export const getTeleconsultas = () => fetchApi<Teleconsulta[]>("/teleconsultas").catch(() => [] as Teleconsulta[]);
export const getTeleconsulta = (id: string) => fetchApi<Teleconsulta>(`/teleconsultas/${id}`).catch(() => null as any);
export const createTeleconsulta = async (data: Partial<Teleconsulta>) => fetchApi<Teleconsulta>("/teleconsultas", { method: "POST", body: JSON.stringify(data) }).catch(() => ({ ...data, id: "mock-" + Date.now(), status: "agendada" } as Teleconsulta));
export const updateTeleconsulta = async (id: string, data: Partial<Teleconsulta>) => fetchApi<Teleconsulta>(`/teleconsultas/${id}`, { method: "PUT", body: JSON.stringify(data) }).catch(() => ({ id, ...data, status: "agendada" } as Teleconsulta));

// ========================
// Upload de Arquivos / IA Mock
// ========================
export const uploadExameResult = async (petId: string, exameId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/pets/${petId}/exames/${exameId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Erro ao fazer upload do exame");
  }

  const updatedPet = await res.json();
  const exame = updatedPet.exames.find((e: any) => e.id === exameId);
  return exame?.resultado || "Nenhum resultado extraído.";
};
