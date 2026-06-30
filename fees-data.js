// Amtliche Gebühren und patentanwaltliche Platzhalter-Gebühren.
// Diese Datei bündelt alle Zahlen an einem Ort, damit sie sich bei Änderungen
// leicht aktualisieren lassen, ohne die Rechenlogik (app.js) anfassen zu müssen.

// ---------------------------------------------------------------------------
// DPMA (Deutsches Patent- und Markenamt) – Beträge in EUR
// ---------------------------------------------------------------------------
const DPMA_FEES = {
  applicationElectronic: 290,
  applicationPaper: 300,
  classesIncluded: 3,
  additionalClassFee: 100,
  acceleratedExamination: 200,
  renewalBase: 750,
  renewalClassesIncluded: 3,
  renewalAdditionalClassFee: 260,
  oppositionFee: 250,
  asOf: "2026-06-30",
  sourceUrl: "https://www.dpma.de/service/gebuehren/marken/index.html",
};

// ---------------------------------------------------------------------------
// EUIPO (Amt der Europäischen Union für geistiges Eigentum) – Beträge in EUR
// ---------------------------------------------------------------------------
const EUIPO_FEES = {
  applicationElectronicClass1: 850,
  applicationElectronicClass2: 50,
  applicationElectronicClass3Plus: 150,
  applicationPaperClass1: 1000,
  renewalClass1: 850,
  renewalClass2: 50,
  renewalClass3Plus: 150,
  oppositionFee: 320,
  asOf: "2026-06-30",
  sourceUrl: "https://www.euipo.europa.eu/en/trade-marks/before-applying/fees-payments",
};

// ---------------------------------------------------------------------------
// WIPO / Madrider System – Beträge in CHF
// ---------------------------------------------------------------------------
const WIPO_BASE_FEES = {
  basicFeeBW: 653,
  basicFeeColor: 903,
  classesIncluded: 3,
  supplementaryClassFee: 100,
  complementaryFee: 100,
  asOf: "2026-06-30",
  sourceUrl: "https://www.wipo.int/en/web/madrid-system/fees/sched",
};

// Benennungsgebühren je designiertem Mitglied. Werte mit verified=false sind
// Recherche-Platzhalter und sollten vor verbindlicher Nutzung gegen den
// offiziellen WIPO Fee Calculator (https://madrid.wipo.int/feecalcapp/) geprüft
// werden. Alle Beträge sind in der App editierbar.
const WIPO_MEMBERS = [
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
  { code: "GB", name: "Vereinigtes Königreich", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "JP", name: "Japan", feeType: "individual", verified: false, note: "Zweistufiges Gebührensystem, exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "CH", name: "Schweiz", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "CA", name: "Kanada", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "IN", name: "Indien", feeType: "individual", verified: false, note: "Tendenziell niedrige Individualgebühr, exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "KR", name: "Südkorea", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "RU", name: "Russland", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen. Zahlungswege können eingeschränkt sein." },
  { code: "BR", name: "Brasilien", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "MX", name: "Mexiko", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "TR", name: "Türkei", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "SG", name: "Singapur", feeType: "complementary", verified: false, note: "Sofern keine Individualgebühr erhoben wird, gilt die Standard-Komplementärgebühr." },
  { code: "NO", name: "Norwegen", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "NZ", name: "Neuseeland", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "UA", name: "Ukraine", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
];

// ---------------------------------------------------------------------------
// Patentanwaltliche Gebühren – Platzhalter, Beträge in EUR
// ---------------------------------------------------------------------------
const ATTORNEY_FEE_ITEMS = [
  { id: "consultation", label: "Erstberatung / Schutzrechtsstrategie", office: "general", perClass: false, amount: 0 },
  { id: "search", label: "Identitäts- und Ähnlichkeitsrecherche", office: "general", perClass: false, amount: 0 },
  { id: "monitoring", label: "Markenüberwachung (pro Jahr)", office: "general", perClass: false, amount: 0 },
  { id: "dpma-filing", label: "DPMA: Anmeldung – Bearbeitungsgebühr", office: "dpma", perClass: false, amount: 0 },
  { id: "dpma-class", label: "DPMA: Anmeldung – Gebühr je Klasse", office: "dpma", perClass: true, amount: 0 },
  { id: "dpma-opposition", label: "DPMA: Widerspruchsverfahren – Bearbeitung", office: "dpma", perClass: false, amount: 0 },
  { id: "dpma-renewal", label: "DPMA: Verlängerung – Bearbeitung", office: "dpma", perClass: false, amount: 0 },
  { id: "euipo-filing", label: "EUIPO: Anmeldung – Bearbeitungsgebühr", office: "euipo", perClass: false, amount: 0 },
  { id: "euipo-class", label: "EUIPO: Anmeldung – Gebühr je Klasse", office: "euipo", perClass: true, amount: 0 },
  { id: "euipo-opposition", label: "EUIPO: Widerspruchsverfahren – Bearbeitung", office: "euipo", perClass: false, amount: 0 },
  { id: "euipo-renewal", label: "EUIPO: Verlängerung – Bearbeitung", office: "euipo", perClass: false, amount: 0 },
  { id: "wipo-filing", label: "WIPO: Anmeldung – Bearbeitungsgebühr", office: "wipo", perClass: false, amount: 0 },
  { id: "wipo-class", label: "WIPO: Anmeldung – Gebühr je Klasse", office: "wipo", perClass: true, amount: 0 },
  { id: "wipo-per-country", label: "WIPO: Auslandskorrespondenz je benanntem Land", office: "wipo", perClass: false, amount: 0 },
  { id: "wipo-renewal", label: "WIPO: Verlängerung – Bearbeitung", office: "wipo", perClass: false, amount: 0 },
];
