export enum UserLevel {
  PASTOR = "Pastor / Líder",
  MEMBRO = "Membro",
  VISITANTE = "Visitante"
}

export interface Church {
  id: string;
  nome: string;
  cidade: string;
  pastor: string;
  plano: "Gratuito" | "Essencial" | "Crescimento" | "Multiplicadora";
  limiteMembros: number;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  email_or_phone: string;
  nivel: UserLevel;
  avatar?: string;
}

export interface Member {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  dataNascimento: string;
  dataBatismo?: string;
  dataConversao?: string;
  ministerio: string;
  estadoCivil: "Solteiro(a)" | "Casado(a)" | "Divorciado(a)" | "Viúvo(a)";
  participacaoPgm: boolean;
  pgmId?: string;
  frequênciaCultos: "Alta" | "Média" | "Baixa" | "Ausente";
  observacoesPastorais?: string;
  dataCadastro: string;
}

export interface Visitor {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  dataVisita: string;
  quemConvidou?: string;
  interesse: string;
  pedidoOracao?: string;
  retornoAoCulto: "Sim" | "Não" | "Pendente";
  atendidoPor?: string;
  statusDiscipulado: "Novo" | "Contactado" | "Em Integração" | "Integrado";
  dataCadastro: string;
}

export interface FinancialTransaction {
  id: string;
  tipo: "Receita" | "Despesa";
  valor: number;
  categoria: "Dízimo" | "Oferta" | "Doação" | "Eventos" | "Reforma" | "Aluguel" | "Ação Social" | "Luz/Água" | "Som/Mídia" | "Outros";
  data: string;
  membroId?: string; // Se for dízimo de membro
  membroNome?: string;
  descricao: string;
  formaPagamento: "PIX" | "Dinheiro" | "Cartão" | "Transferência";
}

export interface PGM {
  id: string;
  nome: string;
  lider: string;
  supervisor?: string;
  anfitricao?: string;
  endereco: string;
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  horario: string;
  participantesCount: number;
  limiteParticipantes: number;
}

export interface EventSchedule {
  id: string;
  nome: string;
  data: string;
  horario: string;
  descricao: string;
  local: string;
  categoria: "Culto" | "PGM" | "Encontro de Jovens" | "EBD" | "Ação de Capacitação" | "Outro";
  inscritos?: number;
}

export interface VolunteerScale {
  id: string;
  ministério: "Louvor" | "Infantil" | "Jovens" | "Casais" | "Família" | "EBD" | "Recepção" | "Mídia" | "Pastoral";
  membroId: string;
  membroNome: string;
  eventoId: string;
  eventoNome: string;
  data: string;
  funcaoScale: string;
  confirmado: "Sim" | "Não" | "Pendente";
}

export interface Devotional {
  id: string;
  titulo: string;
  referenciaBiblica: string;
  textoReferencia: string;
  reflexao: string;
  oracao: string;
  desafioPratico: string;
  autor: string;
  data: string;
}

export interface RadioTrack {
  id: string;
  titulo: string;
  autor: string;
  url: string;
  duracao: string;
  tipo: "Pregação" | "Música" | "Estudo";
}

export interface PgmCell {
  id: string;
  nome: string;
  líderNome: string;
  supervisorNome: string;
  membrosQuantidade: number;
  diaSemanaHorario: string;
  enderecoCompleto?: string;
  multiplicacaoRacio: number;
}

export interface TrainingCourse {
  id: string;
  nome: string;
  descricao: string;
  cargaHoraria: string;
  instrutorNome: string;
  participantesQtd: number;
  progressoConcluintes: number;
}

