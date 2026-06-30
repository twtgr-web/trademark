export interface AttorneyFeeItem {
  id: string;
  label: string;
  office: "general" | "dpma" | "euipo" | "wipo";
  perClass: boolean;
  amount: number;
}

// Platzhalter für die patentanwaltlichen Gebühren. Alle Beträge sind auf 0 gesetzt und
// werden ergänzt, sobald die tatsächlichen Sätze vorliegen. Die Beträge können auch
// direkt in der App unter "Patentanwaltsgebühren" angepasst werden (dort persistiert
// per localStorage) – diese Datei liefert nur die Ausgangswerte/Struktur.
export const attorneyFeesConfigured = false;

export const attorneyFeeItems: AttorneyFeeItem[] = [
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
