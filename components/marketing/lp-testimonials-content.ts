/**
 * Conteúdo da seção de depoimentos da landing.
 * Para incluir alguém: coloque a foto (vertical) e a logo em /public/marketing e acrescente um item.
 * Fotos, logos, academias e nomes são reais; as citações ainda são EXEMPLOS e devem ser trocadas.
 */
export type LandingAcademy = {
  name: string;
  /** Caminho da logo em /public. Sem logo, a seção mostra as iniciais abaixo. */
  logo?: string;
  /** "light" para logo clara em fundo transparente: ganha fundo escuro no selo e aparece escura na tarja. */
  logoTone?: "light";
  initials: string;
};

export type LandingTestimonial = {
  name: string;
  role: string;
  photo: string;
  academy: LandingAcademy;
  quote: string;
};

const ASLAM: LandingAcademy = { name: "Aslam Brazilian Jiu-Jitsu", logo: "/marketing/lp-academia-aslam.png", initials: "AB" };
const SANTOS_BOXING: LandingAcademy = {
  name: "Santos Boxing Fighting School",
  logo: "/marketing/lp-academia-santos-boxing.png",
  logoTone: "light",
  initials: "SB",
};
const TEAM_SANTOS: LandingAcademy = { name: "Team Santos MMA", logo: "/marketing/lp-academia-team-santos.png", initials: "TS" };

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    name: "Maikon Santos",
    role: "Professor de Jiu-Jitsu",
    photo: "/marketing/lp-depo-aslam-instrutor.webp",
    academy: ASLAM,
    quote: "Antes eu fechava o mês no caderno. Hoje sei quem pagou, quem faltou e quem está pronto para graduar.",
  },
  {
    name: "Matheus Santos",
    role: "Professor de Boxe",
    photo: "/marketing/lp-depo-santos-instrutor.webp",
    academy: SANTOS_BOXING,
    quote: "Cadastrei a academia numa tarde. Agora sobra tempo para o que eu gosto: dar aula.",
  },
];

/** Academias exibidas na tarja de logos, com ou sem depoimento. */
export const LANDING_ACADEMIES: LandingAcademy[] = [ASLAM, SANTOS_BOXING, TEAM_SANTOS];
