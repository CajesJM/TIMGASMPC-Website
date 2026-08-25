export const boholMunicipalityCodes = {
  Alburquerque: "0701201000",
  Alicia: "0701202000",
  Anda: "0701203000",
  Antequera: "0701204000",
  Baclayon: "0701205000",
  Balilihan: "0701206000",
  Batuan: "0701207000",
  "Bien Unido": "0701248000",
  Bilar: "0701208000",
  Buenavista: "0701209000",
  Calape: "0701210000",
  Candijay: "0701211000",
  Carmen: "0701212000",
  Catigbian: "0701213000",
  "City of Tagbilaran": "0701242000",
  Clarin: "0701214000",
  Corella: "0701215000",
  Cortes: "0701216000",
  Dagohoy: "0701217000",
  Danao: "0701218000",
  Dauis: "0701219000",
  Dimiao: "0701220000",
  Duero: "0701221000",
  "Garcia Hernandez": "0701222000",
  Getafe: "0701226000",
  Guindulman: "0701223000",
  Inabanga: "0701224000",
  Jagna: "0701225000",
  Lila: "0701227000",
  Loay: "0701228000",
  Loboc: "0701229000",
  Loon: "0701230000",
  Mabini: "0701231000",
  Maribojoc: "0701232000",
  Panglao: "0701233000",
  Pilar: "0701234000",
  "President Carlos P. Garcia": "0701235000",
  Sagbayan: "0701236000",
  "San Isidro": "0701237000",
  "San Miguel": "0701238000",
  Sevilla: "0701239000",
  "Sierra Bullones": "0701240000",
  Sikatuna: "0701241000",
  Talibon: "0701243000",
  Trinidad: "0701244000",
  Tubigon: "0701245000",
  Ubay: "0701246000",
  Valencia: "0701247000",
} as const;

export const boholMunicipalities = Object.keys(boholMunicipalityCodes) as Array<
  keyof typeof boholMunicipalityCodes
>;

type BarangayResponse = { data?: Array<{ name?: string }> };

const barangayCache = new Map<string, string[]>();

// Keeps the form usable while the full Bohol barangay list is loaded for the
// municipality where TIMGAS MPC is located.
barangayCache.set("Trinidad", [
  "Banlasan",
  "Bongbong",
  "Catoogan",
  "Guinobatan",
  "Hinlayagan Ilaud",
  "Hinlayagan Ilaya",
  "Kauswagan",
  "Kinan-oan",
  "La Union",
  "La Victoria",
  "Mabuhay Cabigohan",
  "Mahagbu",
  "Manuel M. Roxas",
  "Poblacion",
  "San Isidro",
  "San Vicente",
  "Santo Tomas",
  "Soom",
  "Tagum Norte",
  "Tagum Sur",
]);

export function getCachedBoholBarangays(municipality: string) {
  return barangayCache.get(municipality) ?? [];
}

export async function getBoholBarangays(municipality: string) {
  const cachedBarangays = barangayCache.get(municipality);
  if (cachedBarangays) return cachedBarangays;

  const municipalityCode =
    boholMunicipalityCodes[municipality as keyof typeof boholMunicipalityCodes];
  if (!municipalityCode) return [];

  const response = await fetch(
    `https://psgc.cloud/api/v2/cities-municipalities/${municipalityCode}/barangays`,
  );
  if (!response.ok) throw new Error("Unable to load barangays.");

  const payload = (await response.json()) as BarangayResponse;
  const barangays = (payload.data ?? [])
    .map((barangay) => barangay.name?.trim() ?? "")
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));
  barangayCache.set(municipality, barangays);
  return barangays;
}

export function formatBoholAddress(
  streetOrPurok: string,
  barangay: string,
  municipality: string,
) {
  return [streetOrPurok.trim(), barangay.trim(), municipality.trim(), "Bohol"]
    .filter(Boolean)
    .join(", ");
}

export function ensureBoholAddress(address: string) {
  const normalized = address.trim();
  if (!normalized || /,?\s*Bohol(?:,\s*Philippines)?\s*$/i.test(normalized)) {
    return normalized || "Bohol";
  }
  return `${normalized}, Bohol`;
}
