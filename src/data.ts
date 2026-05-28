import { Member, Visitor, FinancialTransaction, PGM, EventSchedule, VolunteerScale, Devotional, RadioTrack, User, UserLevel } from "./types";

// Versículos de Incentivo à Generosidade
export interface BibleVerse {
  versículo: string;
  referência: string;
  contexto: string;
}

export const GENEROSITY_VERSES: BibleVerse[] = [
  {
    versículo: "Cada um contribua segundo propôs no seu coração; não com tristeza ou por necessidade, porque Deus ama ao que dá com alegria.",
    referência: "2 Coríntios 9:7",
    contexto: "O apóstolo Paulo exorta sobre a satisfação e o privilégio espiritual de apoiar o ministério local."
  },
  {
    versículo: "Honre ao Senhor com todos os seus recursos e com os primeiros frutos de todas as suas colheitas.",
    referência: "Provérbios 3:9",
    contexto: "Promessa de abundância no provimento de Deus ao colocarmos o Reino em primeiro lugar."
  },
  {
    versículo: "Mais bem-aventurada coisa é dar do que receber.",
    referência: "Atos 20:35",
    contexto: "Palavras do próprio Senhor Jesus lembrando-nos que doar enriquece nossa alma."
  },
  {
    versículo: "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e depois fazei prova de mim nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu...",
    referência: "Malaquias 3:10",
    contexto: "Um convite ousado à fidelidade financeira e ao transbordamento das bênçãos do céu."
  },
  {
    versículo: "O generoso prosperará; quem dá alívio aos outros, alívio receberá.",
    referência: "Provérbios 11:25",
    contexto: "A lei espiritual da semeadura: a generosidade gera mais abundância e amparo mútuo."
  }
];

// Mock Church
export const INITIAL_CHURCH = {
  id: "igreja-01",
  nome: "Igreja Viva",
  cidade: "São Paulo",
  pastor: "Pr. Erivaldo Lima Ferreira",
  plano: "Essencial",
  limiteMembros: 100
};

// Users
export const INITIAL_USERS: User[] = [
  {
    id: "usr-pastor",
    nome: "Pr. Erivaldo Lima Ferreira",
    email: "pastor@igrejaviva.com.br",
    email_or_phone: "pastor@igrejaviva.com.br",
    nivel: UserLevel.PASTOR,
    avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-membro",
    nome: "Matheus Oliveira",
    email: "matheus@igrejaviva.com.br",
    email_or_phone: "matheus@igrejaviva.com.br",
    nivel: UserLevel.MEMBRO,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-visitante",
    nome: "Laura Martins",
    email: "laura@igrejaviva.com.br",
    email_or_phone: "laura@igrejaviva.com.br",
    nivel: UserLevel.VISITANTE,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  }
];

// Initial Members
export const INITIAL_MEMBERS: Member[] = [
  {
    id: "mb-01",
    nome: "Carlos Eduardo Santos",
    telefone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    endereco: "Av. Paulista, 1200 - São Paulo, SP",
    dataNascimento: "1985-04-12",
    dataBatismo: "2010-06-20",
    dataConversao: "2009-11-15",
    ministerio: "Louvor",
    estadoCivil: "Casado(a)",
    participacaoPgm: true,
    pgmId: "pgm-01",
    frequênciaCultos: "Alta",
    observacoesPastorais: "Carlos é guitarrista do ministério e lidera o ensaio de louvor às quintas.",
    dataCadastro: "2010-06-20"
  },
  {
    id: "mb-02",
    nome: "Mariana Alencar",
    telefone: "(11) 97654-3210",
    whatsapp: "(11) 97654-3210",
    endereco: "Rua Bela Cintra, 45 - São Paulo, SP",
    dataNascimento: "1992-09-25",
    dataBatismo: "2018-12-09",
    dataConversao: "2018-02-14",
    ministerio: "Infantil",
    estadoCivil: "Solteiro(a)",
    participacaoPgm: true,
    pgmId: "pgm-02",
    frequênciaCultos: "Alta",
    observacoesPastorais: "Professora dedicada na EBD infantil e auxiliar na recepção dos domingos.",
    dataCadastro: "2018-12-09"
  },
  {
    id: "mb-03",
    nome: "Fernando de Souza",
    telefone: "(11) 91234-5678",
    whatsapp: "(11) 91234-5678",
    endereco: "Alameda Lorena, 980 - São Paulo, SP",
    dataNascimento: "1978-11-30",
    dataBatismo: "2005-03-12",
    dataConversao: "2004-06-08",
    ministerio: "Mídia",
    estadoCivil: "Casado(a)",
    participacaoPgm: true,
    pgmId: "pgm-01",
    frequênciaCultos: "Média",
    observacoesPastorais: "Auxilia na operação de projeção e na transmissão das lives das redes sociais.",
    dataCadastro: "2005-03-12"
  },
  {
    id: "mb-04",
    nome: "Juliana Mendes",
    telefone: "(11) 96543-2198",
    whatsapp: "(11) 96543-2198",
    endereco: "Rua Augusta, 430 - São Paulo, SP",
    dataNascimento: "2001-07-04",
    dataBatismo: "2021-10-31",
    dataConversao: "2021-03-10",
    ministerio: "Jovens",
    estadoCivil: "Solteiro(a)",
    participacaoPgm: false,
    frequênciaCultos: "Baixa",
    observacoesPastorais: "Estudante universitária. Tem faltado alguns cultos por conta do TCC da faculdade. Necessita acompanhamento.",
    dataCadastro: "2021-10-31"
  },
  {
    id: "mb-05",
    nome: "Antônio da Silva Ribeiro",
    telefone: "(11) 98877-6655",
    whatsapp: "(11) 98877-6655",
    endereco: "Rua do Consolação, 2300 - São Paulo, SP",
    dataNascimento: "1960-01-15",
    dataBatismo: "1994-08-14",
    dataConversao: "1990-05-01",
    ministerio: "Pastoral",
    estadoCivil: "Casado(a)",
    participacaoPgm: true,
    pgmId: "pgm-02",
    frequênciaCultos: "Alta",
    observacoesPastorais: "Diácono experiente. Sempre apoia a visitação hospitalar e orações nos lares.",
    dataCadastro: "1994-08-14"
  }
];

// Initial Visitors
export const INITIAL_VISITORS: Visitor[] = [
  {
    id: "vt-01",
    nome: "Laura Martins Rocha",
    telefone: "(11) 94433-2211",
    whatsapp: "(11) 94433-2211",
    dataVisita: "2026-05-17",
    quemConvidou: "Mariana Alencar",
    interesse: "Estudos Bíblicos e Atividades para Crianças",
    pedidoOracao: "Pela saúde do meu filho Arthur de 4 anos.",
    retornoAoCulto: "Sim",
    statusDiscipulado: "Em Integração",
    dataCadastro: "2026-05-17"
  },
  {
    id: "vt-02",
    nome: "Roberto Guedes Santos",
    telefone: "(11) 93322-1100",
    whatsapp: "(11) 93322-1100",
    dataVisita: "2026-05-24",
    quemConvidou: "Carlos Eduardo Santos",
    interesse: "Crescimento Espiritual e Casais",
    pedidoOracao: "Pelo meu casamento e redirecionamento de carreira.",
    retornoAoCulto: "Pendente",
    statusDiscipulado: "Novo",
    dataCadastro: "2026-05-24"
  },
  {
    id: "vt-03",
    nome: "Beatriz Oliveira Ferraz",
    telefone: "(11) 92211-0099",
    whatsapp: "(11) 92211-0099",
    dataVisita: "2026-05-03",
    quemConvidou: "Pastor João Silva",
    interesse: "Pequenos Grupos (PGM)",
    pedidoOracao: "Por cura física de uma enxaqueca crônica.",
    retornoAoCulto: "Sim",
    statusDiscipulado: "Integrado",
    dataCadastro: "2026-05-03"
  }
];

// Initial Financial Entries
export const INITIAL_FINANCEDATA: FinancialTransaction[] = [
  {
    id: "tx-01",
    tipo: "Receita",
    valor: 1500.00,
    categoria: "Dízimo",
    data: "2026-05-10",
    membroId: "mb-01",
    membroNome: "Carlos Eduardo Santos",
    descricao: "Dízimo fiel referente a Maio/2026",
    formaPagamento: "PIX"
  },
  {
    id: "tx-02",
    tipo: "Receita",
    valor: 450.00,
    categoria: "Oferta",
    data: "2026-05-10",
    descricao: "Oferta voluntária Culto de Domingo Noite",
    formaPagamento: "Dinheiro"
  },
  {
    id: "tx-03",
    tipo: "Despesa",
    valor: 650.00,
    categoria: "Aluguel",
    data: "2026-05-05",
    descricao: "Aluguel da sala anexa ministerial - EBD",
    formaPagamento: "Transferência"
  },
  {
    id: "tx-04",
    tipo: "Receita",
    valor: 800.00,
    categoria: "Dízimo",
    data: "2026-05-12",
    membroId: "mb-03",
    membroNome: "Fernando de Souza",
    descricao: "Dízimo de Maio/2026",
    formaPagamento: "PIX"
  },
  {
    id: "tx-05",
    tipo: "Despesa",
    valor: 180.00,
    categoria: "Luz/Água",
    data: "2026-05-15",
    descricao: "Instalação elétrica e consumo de água templo sede",
    formaPagamento: "PIX"
  },
  {
    id: "tx-06",
    tipo: "Receita",
    valor: 350.50,
    categoria: "Oferta",
    data: "2026-05-17",
    descricao: "Oferta voluntária Culto de Celebração Familiar",
    formaPagamento: "Dinheiro"
  },
  {
    id: "tx-07",
    tipo: "Despesa",
    valor: 200.00,
    categoria: "Ação Social",
    data: "2026-05-20",
    descricao: "Cesta básica para assistência à família necessitada local",
    formaPagamento: "PIX"
  },
  {
    id: "tx-08",
    tipo: "Receita",
    valor: 500.00,
    categoria: "Doação",
    data: "2026-05-22",
    descricao: "Doação anônima destinada à compra de microfones",
    formaPagamento: "PIX"
  }
];

// Initial PGMs (Pequenos Grupos Multiplicadores)
export const INITIAL_PGMS: PGM[] = [
  {
    id: "pgm-01",
    nome: "PGM Videira Sede",
    lider: "Carlos Eduardo Santos",
    supervisor: "Pr. João Silva",
    anfitricao: "Clara Santos",
    endereco: "Rua Pamplona, 1040 - Jardim Paulista",
    diaSemana: "Terça",
    horario: "19:30",
    participantesCount: 12,
    limiteParticipantes: 15
  },
  {
    id: "pgm-02",
    nome: "PGM Ebenezer Consolação",
    lider: "Antônio da Silva Ribeiro",
    supervisor: "Pr. João Silva",
    anfitricao: "Maria Ribeiro",
    endereco: "Alameda Lorena, 1400 - Consolação",
    diaSemana: "Quinta",
    horario: "20:00",
    participantesCount: 8,
    limiteParticipantes: 15
  }
];

// Initial Events
export const INITIAL_EVENTS: EventSchedule[] = [
  {
    id: "ev-01",
    nome: "Culto de Celebração & Ceia do Senhor",
    data: "2026-05-31",
    horario: "19:00",
    descricao: "Nosso encontro de gratidão semanal, comunhão profunda e ceia geral.",
    local: "Templo Central",
    categoria: "Culto"
  },
  {
    id: "ev-02",
    nome: "EBD - Escola Bíblica Discipuladora",
    data: "2026-05-31",
    horario: "09:00",
    descricao: "Aulas bíblicas para todas as idades, focadas no discipulado prático.",
    local: "Template Central e salas anexas",
    categoria: "EBD"
  },
  {
    id: "ev-03",
    nome: "Reunião de Líderes e Supervisores (PGM)",
    data: "2026-06-03",
    horario: "20:00",
    descricao: "Capacitação trimestral e alinhamento dos Pequenos Grupos Multiplicadores.",
    local: "Sala de Reuniões",
    categoria: "Ação de Capacitação"
  },
  {
    id: "ev-04",
    nome: "Vigília da Esperança",
    data: "2026-06-05",
    horario: "22:00",
    descricao: "Noite inteira de clamor, louvor, intercessão pelas famílias e missões.",
    local: "Santuário",
    categoria: "Culto"
  }
];

// Volunteer Scale
export const INITIAL_SCALES: VolunteerScale[] = [
  {
    id: "sc-01",
    ministério: "Louvor",
    membroId: "mb-01",
    membroNome: "Carlos Eduardo Santos",
    eventoId: "ev-01",
    eventoNome: "Culto de Celebração & Ceia",
    data: "2026-05-31",
    funcaoScale: "Líder de Louvor & Violão",
    confirmado: "Sim"
  },
  {
    id: "sc-02",
    ministério: "Infantil",
    membroId: "mb-02",
    membroNome: "Mariana Alencar",
    eventoId: "ev-01",
    eventoNome: "Culto de Celebração & Ceia",
    data: "2026-05-31",
    funcaoScale: "Monitora Maternal",
    confirmado: "Pendente"
  },
  {
    id: "sc-03",
    ministério: "Mídia",
    membroId: "mb-03",
    membroNome: "Fernando de Souza",
    eventoId: "ev-01",
    eventoNome: "Culto de Celebração & Ceia",
    data: "2026-05-31",
    funcaoScale: "Fotógrafo & Operação Datashow",
    confirmado: "Sim"
  },
  {
    id: "sc-04",
    ministério: "Recepção",
    membroId: "mb-05",
    membroNome: "Antônio da Silva Ribeiro",
    eventoId: "ev-01",
    eventoNome: "Culto de Celebração & Ceia",
    data: "2026-05-31",
    funcaoScale: "Acolhimento de Visitantes",
    confirmado: "Sim"
  }
];

// Static Default Devotionals
export const STATIC_DEVOTIONALS: Devotional[] = [
  {
    id: "dev-01",
    titulo: "Crescer Saudavelmente no Reino",
    referenciaBiblica: "Colossenses 2:6-7",
    textoReferencia: "Portanto, assim como receberam Cristo Jesus, o Senhor, continuem a viver nele, enraizados e edificados nele, firmados na fé, como foram ensinados, transbordando de gratidão.",
    reflexao: "Crescer de maneira multiplicadora exige de nós uma fundação espiritual profunda. Assim como uma árvore lança raízes profundas antes de produzir galhos largos, o discipulador sincero prioriza a intimidade diária com Cristo. Quando a nossa vida e os nossos ministérios estão firmados nas escrituras e cultivados com compaixão, a multiplicação e os frutos saudáveis ocorrem de maneira orgânica e abundante no Reino de Deus.",
    oracao: "Querido Deus, ajuda-nos a aprofundar nossas raízes espirituais em Ti. Que o nosso trabalho em Pequenos Grupos tenha o único propósito de ver vidas enraizadas no Teu evangelho de amor e graça. Abençoa nossa comunidade espiritual para que cresça transbordando de sincera gratidão. Amém.",
    desafioPratico: "Passe 15 minutos hoje orando especificamente pelos líderes de pequeno grupo de sua igreja local e envie-lhes uma palavra alegre de encorajamento.",
    autor: "Pr. João Silva",
    data: "26 de Maio de 2026"
  }
];

// Mock Radio Tracks
export const STATIC_RADIO_TRACKS: RadioTrack[] = [
  {
    id: "rad-01",
    titulo: "A Essência da Igreja Multiplicadora",
    autor: "Pr. João Silva",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duracao: "12:45",
    tipo: "Pregação"
  },
  {
    id: "rad-02",
    titulo: "Poder do Discipulado em Pequenos Grupos",
    autor: "Diác. Antônio R.",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duracao: "08:30",
    tipo: "Estudo"
  },
  {
    id: "rad-03",
    titulo: "Louvor Instrumental: Adoração & Paz",
    autor: "Ministério Igreja Viva",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duracao: "04:15",
    tipo: "Música"
  },
  {
    id: "rad-04",
    titulo: "Comunhão Real no Corpo de Cristo",
    autor: "Pr. João Silva",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duracao: "15:20",
    tipo: "Pregação"
  }
];


// STORAGE AND ACCESS UTILITIES WITH PERSISTENCE
function getStored<T>(key: string, initial: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  } catch (e) {
    return initial;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// Stateful persistent repositories
export class DBRepository {
  static getMembers(): Member[] {
    return getStored("iv_members", INITIAL_MEMBERS);
  }
  static saveMembers(members: Member[]) {
    setStored("iv_members", members);
  }

  static getVisitors(): Visitor[] {
    return getStored("iv_visitors", INITIAL_VISITORS);
  }
  static saveVisitors(visitors: Visitor[]) {
    setStored("iv_visitors", visitors);
  }

  static getFinance(): FinancialTransaction[] {
    return getStored("iv_finance", INITIAL_FINANCEDATA);
  }
  static saveFinance(finance: FinancialTransaction[]) {
    setStored("iv_finance", finance);
  }

  static getPGMs(): PGM[] {
    return getStored("iv_pgms", INITIAL_PGMS);
  }
  static savePGMs(pgms: PGM[]) {
    setStored("iv_pgms", pgms);
  }

  static getEvents(): EventSchedule[] {
    return getStored("iv_events", INITIAL_EVENTS);
  }
  static saveEvents(events: EventSchedule[]) {
    setStored("iv_events", events);
  }

  static getScales(): VolunteerScale[] {
    return getStored("iv_scales", INITIAL_SCALES);
  }
  static saveScales(scales: VolunteerScale[]) {
    setStored("iv_scales", scales);
  }

  static getDevotionals(): Devotional[] {
    return getStored("iv_devotionals", STATIC_DEVOTIONALS);
  }
  static saveDevotionals(devotionals: Devotional[]) {
    setStored("iv_devotionals", devotionals);
  }
}

// Initial datasets for cells and courses EBD
export const INITIAL_PGM_CELLS = [
  {
    id: "cel-01",
    nome: "PGM Videira Sede",
    líderNome: "Carlos Eduardo Santos",
    supervisorNome: "Pr. João Silva",
    membrosQuantidade: 12,
    diaSemanaHorario: "Terça-feira, 19:30",
    enderecoCompleto: "Rua Pamplona, 1040 - Jardim Paulista",
    multiplicacaoRacio: 80
  },
  {
    id: "cel-02",
    nome: "PGM Ebenezer Consolação",
    líderNome: "Antônio da Silva Ribeiro",
    supervisorNome: "Pr. João Silva",
    membrosQuantidade: 8,
    diaSemanaHorario: "Quinta-feira, 20h",
    enderecoCompleto: "Alameda Lorena, 1400 - Consolação",
    multiplicacaoRacio: 40
  }
];

export const INITIAL_COURSES = [
  {
    id: "crs-01",
    nome: "Introdução à Maturidade Cristã",
    descricao: "Estudo aprofundado dos princípios da fé cristã, oração e leitura bíblica diária.",
    cargaHoraria: "12 horas",
    instrutorNome: "Pr. João Silva",
    participantesQtd: 15,
    progressoConcluintes: 45
  },
  {
    id: "crs-02",
    nome: "Treinamento de Líderes de PGM",
    descricao: "Formação teórico-prática para pastoreio mútuo, dinâmica de reuniões e multiplicação.",
    cargaHoraria: "18 horas",
    instrutorNome: "Pr. João Silva",
    participantesQtd: 6,
    progressoConcluintes: 75
  }
];

// App.tsx Import Bindings
export function getInitialState() {
  return {
    members: DBRepository.getMembers(),
    visitors: DBRepository.getVisitors(),
    transactions: DBRepository.getFinance(),
    events: DBRepository.getEvents(),
    scales: DBRepository.getScales(),
    pgms: getStored("iv_pgm_cells", INITIAL_PGM_CELLS),
    courses: getStored("iv_courses", INITIAL_COURSES),
  };
}

export function saveMembersList(m: any[]) {
  DBRepository.saveMembers(m);
}

export function saveVisitorsList(v: any[]) {
  DBRepository.saveVisitors(v);
}

export function saveFinancialTransactions(t: any[]) {
  DBRepository.saveFinance(t);
}

export function saveEventsSchedule(ev: any[]) {
  DBRepository.saveEvents(ev);
}

export function saveVolunteerScales(sc: any[]) {
  DBRepository.saveScales(sc);
}

export function savePgmsList(p: any[]) {
  setStored("iv_pgm_cells", p);
}

export function saveCoursesList(c: any[]) {
  setStored("iv_courses", c);
}

