/**
 * Conteúdo da seção de depoimentos da landing.
 * Para incluir alguém: coloque a foto (vertical) e a logo em /public/marketing e acrescente um item.
 * Os itens abaixo são EXEMPLOS e devem ser trocados pelos depoimentos reais.
 */
export type LandingAcademy = {
  name: string;
  /** Caminho da logo em /public. Sem logo, a seção mostra as iniciais. */
  logo?: string;
  initials: string;
};

export type LandingTestimonial = {
  name: string;
  role: string;
  photo: string;
  academy: LandingAcademy;
  quote: string;
};

const TATAME_NORTE: LandingAcademy = { name: "Equipe Tatame Norte", initials: "TN" };
const VILA_NOVA: LandingAcademy = { name: "Muay Thai Vila Nova", initials: "VN" };
const CLUBE_CENTRAL: LandingAcademy = { name: "Judô Clube Central", initials: "JC" };

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    name: "Professor Exemplo",
    role: "Professor de Jiu-Jitsu",
    photo: "/marketing/lp-stock-coach-tablet.jpg",
    academy: TATAME_NORTE,
    quote: "Antes eu fechava o mês no caderno. Hoje sei quem pagou, quem faltou e quem está pronto para graduar.",
  },
  {
    name: "Mestra Exemplo",
    role: "Dona de academia de Muay Thai",
    photo: "/marketing/lp-stock-sparring.jpg",
    academy: VILA_NOVA,
    quote: "Cadastrei a academia numa tarde. Agora sobra tempo para o que eu gosto: dar aula.",
  },
];

/** Academias exibidas na faixa de logos, com ou sem depoimento. */
export const LANDING_ACADEMIES: LandingAcademy[] = [TATAME_NORTE, VILA_NOVA, CLUBE_CENTRAL];
