// Subdocumentos
export interface Diagnostico {
  id?: string;
  data?: string; // ISO DateTime
  consultaId?: string | null;
  
  // Sintomas textuais
  sintoma1?: string | null;
  sintoma2?: string | null;
  sintoma3?: string | null;
  sintoma4?: string | null;
  duracaoSintomas?: string | null;
  
  // Sintomas booleanos
  perdaApetite: boolean;
  vomito: boolean;
  diarreia: boolean;
  tosse: boolean;
  dificuldadeRespiratoria: boolean;
  claudicacao: boolean;
  lesoesPele: boolean;
  secrecaoNasal: boolean;
  secrecaoOcular: boolean;
  
  // Sinais vitais
  temperaturaCorporal?: number | null;
  frequenciaCardiaca?: number | null;
  
  // Retornos de IA
  doencaPredita?: string | null;
  confiancaPredicao?: number | null;
  analiseGenAI?: string | null;
}

export interface Exame {
  id?: string;
  nome: string;
  data?: string;
  pedidoMedico?: string | null;
  resultado?: string | null;
  anotacoes?: string | null;
}

export interface Tratamento {
  id?: string;
  nome_procedimento: string;
  dosagem?: string | null;
  frequencia?: string | null;
  inicio?: string;
  fim?: string | null;
  obs?: string | null;
}

export interface Vacina {
  id?: string;
  nome: string;
  data: string;
}

// Entidades Principais
export interface Pet {
  id?: string; // O MongoDB vai retornar como 'id', enviamos sem se for novo
  nome: string;
  especie: string;
  raca: string;
  sexo: string;
  idade: number;
  peso: number;
  cor: string;
  tutorId: string;
  foto: string;
  diagnosticoAtual?: string | null;
  
  exames: Exame[];
  tratamentos: Tratamento[];
  vacinas: Vacina[];
  historico: Diagnostico[];
}

export interface Tutor {
  id?: string;
  nome: string;
  cpf: string;
  sexo: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  petIds: string[];
}

export interface Vet {
  id?: string;
  nome: string;
  crmv: string;
  sexo: string;
  data_nascimento: string;
  especialidade: string;
  email: string;
  foto: string;
}

export interface Teleconsulta {
  id?: string;
  petId: string;
  tutorId: string;
  vetId: string;
  data: string;
  duracaoMin: number;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  queixas?: string | null;
  sintomasRelatados?: string | null;
  diagnostico?: string | null;
  examesSolicitados: string[];
  tratamentoPrescrito?: string | null;
}
