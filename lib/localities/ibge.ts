import { z } from "zod";

import { BRAZIL_STATES, type AcademyOnboarding } from "@/lib/validations/academy-registration";
import bundledMunicipalities from "./municipalities.json";

const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const BRASIL_API_BASE_URL = "https://brasilapi.com.br/api/ibge/municipios/v1";
const MUNICIPALITY_TIMEOUT_MS = 8_000;

const ibgeMunicipalitySchema = z.array(z.object({
  id: z.number().int().positive(),
  nome: z.string().trim().min(2),
}));

const brasilApiMunicipalitySchema = z.array(z.object({
  codigo_ibge: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  nome: z.string().trim().min(2),
}));

export type BrazilianMunicipality = {
  id: string;
  name: string;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type MunicipalityCatalog = Record<string, readonly BrazilianMunicipality[]>;

/** IBGE snapshot. The Vercel function runs in the US and both live sources time out there. */
const OFFICIAL_MUNICIPALITIES = bundledMunicipalities as MunicipalityCatalog;

function isBrazilianState(state: string): state is (typeof BRAZIL_STATES)[number] {
  return (BRAZIL_STATES as readonly string[]).includes(state);
}

function normalizeMunicipalityName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

/**
 * Official municipalities for a state.
 * The committed IBGE snapshot is the source on the request path.
 * Live IBGE and BrasilAPI remain only when a state is missing from that snapshot.
 * `catalog` exists so tests can exercise that remote fallback.
 */
export async function getBrazilianMunicipalities(
  state: string,
  fetcher: Fetcher = fetch,
  catalog: MunicipalityCatalog = OFFICIAL_MUNICIPALITIES,
): Promise<BrazilianMunicipality[]> {
  if (!isBrazilianState(state)) throw new Error("Estado brasileiro inválido.");

  const bundled = catalog[state];
  if (bundled?.length) {
    return sortMunicipalities(bundled.map(({ id, name }) => ({ id: String(id), name })));
  }

  try {
    return sortMunicipalities(await readIbgeMunicipalities(state, fetcher));
  } catch {
    return sortMunicipalities(await readBrasilApiMunicipalities(state, fetcher));
  }
}

async function readIbgeMunicipalities(state: string, fetcher: Fetcher): Promise<BrazilianMunicipality[]> {
  const response = await fetcher(`${IBGE_BASE_URL}/${state}/municipios`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(MUNICIPALITY_TIMEOUT_MS),
    next: { revalidate: 86_400 },
  } as RequestInit);

  if (!response.ok) throw new Error("Não foi possível consultar os municípios do IBGE.");

  const payload = ibgeMunicipalitySchema.safeParse(await response.json());
  if (!payload.success) throw new Error("A resposta de municípios do IBGE é inválida.");

  return payload.data.map(({ id, nome }) => ({ id: String(id), name: nome }));
}

async function readBrasilApiMunicipalities(state: string, fetcher: Fetcher): Promise<BrazilianMunicipality[]> {
  const response = await fetcher(`${BRASIL_API_BASE_URL}/${state}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(MUNICIPALITY_TIMEOUT_MS),
    next: { revalidate: 86_400 },
  } as RequestInit);

  if (!response.ok) throw new Error("Não foi possível consultar os municípios agora.");

  const payload = brasilApiMunicipalitySchema.safeParse(await response.json());
  if (!payload.success) throw new Error("A resposta de municípios é inválida.");

  return payload.data.map(({ codigo_ibge, nome }) => ({ id: String(codigo_ibge), name: nome }));
}

function sortMunicipalities(municipalities: BrazilianMunicipality[]): BrazilianMunicipality[] {
  return [...municipalities].sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
}

/** Revalidates a submitted state/city pair against the authoritative municipality list. */
export async function isBrazilianMunicipalitySelectionValid(
  selection: Pick<AcademyOnboarding, "state" | "cityId" | "city">,
  fetcher: Fetcher = fetch,
): Promise<boolean> {
  const municipalities = await getBrazilianMunicipalities(selection.state, fetcher);
  const submittedName = normalizeMunicipalityName(selection.city);

  return municipalities.some((municipality) =>
    municipality.id === selection.cityId &&
    normalizeMunicipalityName(municipality.name) === submittedName,
  );
}
