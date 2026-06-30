import { WipoBaseFees, WipoMember } from "./types";

// Grundgebühren des internationalen Markensystems (Madrider System) der WIPO, in CHF.
export const wipoBaseFees: WipoBaseFees = {
  basicFeeBW: 653,
  basicFeeColor: 903,
  classesIncluded: 3,
  supplementaryClassFee: 100,
  complementaryFee: 100,
  asOf: "2026-06-30",
  sourceUrl: "https://www.wipo.int/en/web/madrid-system/fees/sched",
  verified: true,
};

// Benennungsgebühren je designiertem Mitglied. Für Mitglieder mit "individual"-Gebühr
// weicht die tatsächliche Gebühr vom Standard-Komplementärbetrag (CHF 100) ab.
//
// Hinweis: Die Werte mit verified=false sind Recherche-Platzhalter (Stand siehe asOf in
// wipoBaseFees) und sollten vor verbindlicher Nutzung gegen den offiziellen WIPO Fee
// Calculator (https://madrid.wipo.int/feecalcapp/) geprüft werden. Alle Beträge sind in
// der App editierbar.
export const wipoMembers: WipoMember[] = [
  {
    code: "US",
    name: "USA",
    feeType: "individual",
    verified: true,
    individualFee: { class1: 460, renewal: 249 },
    note: "Individualgebühr je Klasse; ab 12.04.2026 gesenkt (vorher CHF 530). Pauschale Verlängerungsgebühr unabhängig von Klassenzahl.",
  },
  {
    code: "CN",
    name: "China",
    feeType: "individual",
    verified: true,
    individualFee: { class1: 249, class2to3: 0, class4Plus: 125 },
    note: "1. Klasse CHF 249, 2.+3. Klasse gebührenfrei, ab 4. Klasse je CHF 125.",
  },
  {
    code: "AU",
    name: "Australien",
    feeType: "individual",
    verified: true,
    individualFee: { class1: 232 },
    note: "Individualgebühr je Klasse.",
  },
  {
    code: "EU",
    name: "Europäische Union (EUIPO via Madrid)",
    feeType: "individual",
    verified: false,
    individualFee: { class1: 897, class2to3: 54, class4Plus: 161 },
    note: "Schätzwert, bitte vor Nutzung prüfen. Gesonderte Benennung der EU im Madrider System (unabhängig von einer Direktanmeldung beim EUIPO).",
  },
  {
    code: "GB",
    name: "Vereinigtes Königreich",
    feeType: "individual",
    verified: false,
    note: "Individualgebühr, exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "JP",
    name: "Japan",
    feeType: "individual",
    verified: false,
    note: "Zweistufiges Gebührensystem (Grund- und Registrierungsgebühr), exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "CH",
    name: "Schweiz",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "CA",
    name: "Kanada",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "IN",
    name: "Indien",
    feeType: "individual",
    verified: false,
    note: "Tendenziell niedrige Individualgebühr, exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "KR",
    name: "Südkorea",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "RU",
    name: "Russland",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen. Zahlungswege können eingeschränkt sein.",
  },
  {
    code: "BR",
    name: "Brasilien",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "MX",
    name: "Mexiko",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "TR",
    name: "Türkei",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "SG",
    name: "Singapur",
    feeType: "complementary",
    verified: false,
    note: "Sofern keine Individualgebühr erhoben wird, gilt die Standard-Komplementärgebühr.",
  },
  {
    code: "NO",
    name: "Norwegen",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "NZ",
    name: "Neuseeland",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
  {
    code: "UA",
    name: "Ukraine",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
  },
];
