// Swiss-specific location utilities
export const SWISS_CANTONS = [
  { code: "AG", name: "Aargau", name_de: "Aargau", name_fr: "Argovie", name_it: "Argovia" },
  {
    code: "AI",
    name: "Appenzell Innerrhoden",
    name_de: "Appenzell Innerrhoden",
    name_fr: "Appenzell Rhodes-Intérieures",
    name_it: "Appenzello Interno",
  },
  {
    code: "AR",
    name: "Appenzell Ausserrhoden",
    name_de: "Appenzell Ausserrhoden",
    name_fr: "Appenzell Rhodes-Extérieures",
    name_it: "Appenzello Esterno",
  },
  { code: "BE", name: "Bern", name_de: "Bern", name_fr: "Berne", name_it: "Berna" },
  {
    code: "BL",
    name: "Basel-Landschaft",
    name_de: "Basel-Landschaft",
    name_fr: "Bâle-Campagne",
    name_it: "Basilea Campagna",
  },
  { code: "BS", name: "Basel-Stadt", name_de: "Basel-Stadt", name_fr: "Bâle-Ville", name_it: "Basilea Città" },
  { code: "FR", name: "Fribourg", name_de: "Freiburg", name_fr: "Fribourg", name_it: "Friburgo" },
  { code: "GE", name: "Geneva", name_de: "Genf", name_fr: "Genève", name_it: "Ginevra" },
  { code: "GL", name: "Glarus", name_de: "Glarus", name_fr: "Glaris", name_it: "Glarona" },
  { code: "GR", name: "Graubünden", name_de: "Graubünden", name_fr: "Grisons", name_it: "Grigioni" },
  { code: "JU", name: "Jura", name_de: "Jura", name_fr: "Jura", name_it: "Giura" },
  { code: "LU", name: "Lucerne", name_de: "Luzern", name_fr: "Lucerne", name_it: "Lucerna" },
  { code: "NE", name: "Neuchâtel", name_de: "Neuenburg", name_fr: "Neuchâtel", name_it: "Neuchâtel" },
  { code: "NW", name: "Nidwalden", name_de: "Nidwalden", name_fr: "Nidwald", name_it: "Nidvaldo" },
  { code: "OW", name: "Obwalden", name_de: "Obwalden", name_fr: "Obwald", name_it: "Obvaldo" },
  { code: "SG", name: "St. Gallen", name_de: "St. Gallen", name_fr: "Saint-Gall", name_it: "San Gallo" },
  { code: "SH", name: "Schaffhausen", name_de: "Schaffhausen", name_fr: "Schaffhouse", name_it: "Sciaffusa" },
  { code: "SO", name: "Solothurn", name_de: "Solothurn", name_fr: "Soleure", name_it: "Soletta" },
  { code: "SZ", name: "Schwyz", name_de: "Schwyz", name_fr: "Schwytz", name_it: "Svitto" },
  { code: "TG", name: "Thurgau", name_de: "Thurgau", name_fr: "Thurgovie", name_it: "Turgovia" },
  { code: "TI", name: "Ticino", name_de: "Tessin", name_fr: "Tessin", name_it: "Ticino" },
  { code: "UR", name: "Uri", name_de: "Uri", name_fr: "Uri", name_it: "Uri" },
  { code: "VD", name: "Vaud", name_de: "Waadt", name_fr: "Vaud", name_it: "Vaud" },
  { code: "VS", name: "Valais", name_de: "Wallis", name_fr: "Valais", name_it: "Vallese" },
  { code: "ZG", name: "Zug", name_de: "Zug", name_fr: "Zoug", name_it: "Zugo" },
  { code: "ZH", name: "Zurich", name_de: "Zürich", name_fr: "Zurich", name_it: "Zurigo" },
] as const

export const MAJOR_SWISS_CITIES = [
  { name: "Zürich", canton: "ZH", postal_codes: ["8000", "8001", "8002", "8003", "8004", "8005"] },
  { name: "Geneva", canton: "GE", postal_codes: ["1200", "1201", "1202", "1203", "1204", "1205"] },
  { name: "Basel", canton: "BS", postal_codes: ["4000", "4001", "4002", "4003", "4051", "4052"] },
  { name: "Bern", canton: "BE", postal_codes: ["3000", "3001", "3003", "3004", "3005", "3006"] },
  { name: "Lausanne", canton: "VD", postal_codes: ["1000", "1001", "1002", "1003", "1004", "1005"] },
  { name: "Winterthur", canton: "ZH", postal_codes: ["8400", "8401", "8402", "8403", "8404", "8405"] },
  { name: "Lucerne", canton: "LU", postal_codes: ["6000", "6001", "6002", "6003", "6004", "6005"] },
  { name: "St. Gallen", canton: "SG", postal_codes: ["9000", "9001", "9002", "9003", "9004", "9005"] },
  { name: "Lugano", canton: "TI", postal_codes: ["6900", "6901", "6902", "6903", "6904", "6905"] },
  { name: "Biel/Bienne", canton: "BE", postal_codes: ["2500", "2501", "2502", "2503", "2504", "2505"] },
] as const

export function getCantonByCode(code: string) {
  return SWISS_CANTONS.find((canton) => canton.code === code)
}

export function getCitiesByCanton(cantonCode: string) {
  return MAJOR_SWISS_CITIES.filter((city) => city.canton === cantonCode)
}

export function validateSwissPostalCode(postalCode: string): boolean {
  // Swiss postal codes are 4 digits, range 1000-9999
  const code = Number.parseInt(postalCode)
  return /^\d{4}$/.test(postalCode) && code >= 1000 && code <= 9999
}
