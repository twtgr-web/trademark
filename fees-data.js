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
// UKIPO (UK Intellectual Property Office) – Direktanmeldung, Beträge in GBP
// ---------------------------------------------------------------------------
// Keine Anmeldung über WIPO/Madrid, sondern direkt national beim UKIPO. Bislang nur
// Anmeldegebühren bekannt (keine Verlängerung).
const UKIPO_FEES = {
  officialClass1: 205,
  officialAdditionalClassFee: 60,
  attorneyClass1: 520,
  attorneyAdditionalClassFee: 140,
  asOf: "2026-07-02",
  note: "Direktanmeldung UK (nicht über WIPO/Madrid als GB-Benennung).",
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
// attorneyDesignationFee: anwaltliches Honorar je Land bei Erstbenennung (EUR), Default
// siehe ATTORNEY_DEFAULT_DESIGNATION_FEE_EUR, Ausnahmen unten je Mitglied hinterlegt.
// attorneyRenewalDesignationFee: anwaltliches Honorar je Land bei Verlängerung (EUR),
// Default siehe ATTORNEY_DEFAULT_RENEWAL_DESIGNATION_FEE_EUR.
// localAttorneyFee: Honorar des lokalen Korrespondenzanwalts vor Ort (eigene Währung,
// i. d. R. nicht von dt. USt. betroffen). Nur hinterlegt, wo bekannt – sonst 0/leer.
const WIPO_MEMBERS = [
  {
    code: "US",
    name: "USA",
    feeType: "individual",
    verified: true,
    individualFee: { class1: 460, renewal: 249 },
    note: "Individualgebühr je Klasse; ab 12.04.2026 gesenkt (vorher CHF 530). Pauschale Verlängerungsgebühr unabhängig von Klassenzahl.",
    attorneyRenewalDesignationFee: 370,
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
    attorneyDesignationFee: 740,
  },
  { code: "GB", name: "Vereinigtes Königreich", feeType: "individual", verified: false, note: "Exakter Betrag nicht verifiziert – bitte ergänzen." },
  { code: "JP", name: "Japan", feeType: "individual", verified: false, note: "Zweistufiges Gebührensystem, exakter Betrag nicht verifiziert – bitte ergänzen." },
  {
    code: "CH",
    name: "Schweiz",
    feeType: "individual",
    verified: false,
    note: "Exakter Betrag nicht verifiziert – bitte ergänzen.",
    localAttorneyFee: { amount: 450, currency: "CHF" },
  },
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

// Standardwerte für die anwaltlichen Benennungshonorare, sofern beim Mitglied oben kein
// abweichender Wert hinterlegt ist (siehe attorneyDesignationFee / attorneyRenewalDesignationFee).
const ATTORNEY_DEFAULT_DESIGNATION_FEE_EUR = 120;
const ATTORNEY_DEFAULT_RENEWAL_DESIGNATION_FEE_EUR = 145;

// ---------------------------------------------------------------------------
// Patentanwaltliche Gebühren – Beträge in EUR (netto)
// ---------------------------------------------------------------------------
// Vereinfachungen gegenüber der zugrunde liegenden Honorarliste:
// - Es wird durchgängig der Satz für "Marke" (nicht Kollektivmarke) und für
//   Multiclass-fähige Länder verwendet; abweichende Sätze für Kollektivmarken bzw.
//   Nicht-Multiclass-Länder sind in der Originalliste höher und hier nicht separat
//   abgebildet.
// - Honorare für DPMA-Widerspruch sowie DPMA/EUIPO-Verlängerung waren auf der
//   vorliegenden Kopie nicht eindeutig zuzuordnen und sind daher als 0 belassen.
//
// scope: "flat" (einmalig), "perExtraClass" (je Klasse ab der 4.), "perCountry"
// (je bei WIPO benanntem Land).
const ATTORNEY_FEE_ITEMS = [
  { id: "consultation", label: "Erstberatung / Schutzrechtsstrategie", group: "Allgemein", scope: "flat", enabled: false, amount: 0 },
  { id: "search", label: "Identitäts- und Ähnlichkeitsrecherche", group: "Allgemein", scope: "flat", enabled: false, amount: 0 },
  { id: "monitoring", label: "Markenüberwachung (pro Jahr)", group: "Allgemein", scope: "flat", enabled: false, amount: 0 },

  { id: "europa-priority", label: "Beanspruchung einer Priorität", group: "Marke Europa (DPMA/EUIPO)", scope: "flat", enabled: false, amount: 135 },
  { id: "europa-publication", label: "Bericht über die Veröffentlichung der Markenanmeldung", group: "Marke Europa (DPMA/EUIPO)", scope: "flat", enabled: false, amount: 180 },
  { id: "europa-certificate", label: "Übersendung der Urkunde", group: "Marke Europa (DPMA/EUIPO)", scope: "flat", enabled: false, amount: 220 },

  { id: "dpma-filing", label: "DPMA: Grundgebühr Anmeldung (bis 3 Klassen)", group: "DPMA", scope: "flat", enabled: false, amount: 620 },
  { id: "dpma-class", label: "DPMA: Klassengebühr ab der 4. Klasse", group: "DPMA", scope: "perExtraClass", enabled: false, amount: 90 },
  { id: "dpma-opposition", label: "DPMA: Widerspruchsverfahren – Bearbeitung", group: "DPMA", scope: "flat", enabled: false, amount: 0 },
  { id: "dpma-renewal", label: "DPMA: Verlängerung – Bearbeitung", group: "DPMA", scope: "flat", enabled: false, amount: 0 },

  { id: "euipo-filing", label: "EUIPO: Grundgebühr Anmeldung (bis 3 Klassen)", group: "EUIPO", scope: "flat", enabled: false, amount: 620 },
  { id: "euipo-class", label: "EUIPO: Klassengebühr ab der 4. Klasse", group: "EUIPO", scope: "perExtraClass", enabled: false, amount: 90 },
  { id: "euipo-opposition", label: "EUIPO: Widerspruchsverfahren – Bearbeitung", group: "EUIPO", scope: "flat", enabled: false, amount: 0 },
  { id: "euipo-renewal", label: "EUIPO: Verlängerung – Bearbeitung", group: "EUIPO", scope: "flat", enabled: false, amount: 0 },

  { id: "wipo-filing", label: "WIPO: Grundgebühr Registrierung IR-Marke (bis 3 Klassen)", group: "WIPO – Anmeldung (IR-Marke)", scope: "flat", enabled: false, amount: 940 },
  { id: "wipo-class", label: "WIPO: Zusatzgebühr ab der 4. Warenklasse", group: "WIPO – Anmeldung (IR-Marke)", scope: "perExtraClass", enabled: false, amount: 125 },
  { id: "wipo-priority", label: "WIPO: Beanspruchung einer Priorität (mit Beleg: 220 €)", group: "WIPO – Anmeldung (IR-Marke)", scope: "flat", enabled: false, amount: 140 },
  { id: "wipo-certificate", label: "WIPO: Übersendung der Urkunde", group: "WIPO – Anmeldung (IR-Marke)", scope: "flat", enabled: false, amount: 280 },
  { id: "wipo-completion", label: "WIPO: Abschluss Schutzzulassungsverfahren (Pauschale)", group: "WIPO – Anmeldung (IR-Marke)", scope: "flat", enabled: false, amount: 135 },
  { id: "wipo-takeover", label: "WIPO: Übernahme Vertretung nach Schutzzulassung", group: "WIPO – Anmeldung (IR-Marke)", scope: "flat", enabled: false, amount: 340 },
  { id: "wipo-foreign-coordination", label: "WIPO: Vertretung bei Schutzzulassungsverfahren im Ausland je Land (zzgl. Aufwand)", group: "WIPO – Anmeldung (IR-Marke)", scope: "perCountry", enabled: false, amount: 280 },

  { id: "wipo-renewal", label: "WIPO: Grundgebühr Verlängerung (bis 3 Klassen)", group: "WIPO – Verlängerung (IR-Marke)", scope: "flat", enabled: false, amount: 620 },
  { id: "wipo-renewal-class", label: "WIPO: Verlängerung – Zusatzgebühr je weitere Klasse (ab 3.)", group: "WIPO – Verlängerung (IR-Marke)", scope: "perExtraClass", enabled: false, amount: 105 },
];

// Standard-USt.-Satz für Inlandsmandate. Amtliche Gebühren (DPMA/EUIPO/WIPO) sind
// Behördengebühren und nicht umsatzsteuerpflichtig, daher gilt dieser Satz nur für die
// patentanwaltlichen Gebühren. Das Vor-Ort-Honorar ausländischer Korrespondenzanwälte
// (siehe WIPO_MEMBERS.localAttorneyFee) wird ebenfalls ohne deutsche USt. ausgewiesen.
const ATTORNEY_VAT_RATE_DEFAULT = 19;
