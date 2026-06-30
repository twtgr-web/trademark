import { EuipoFees } from "./types";

// Amtliche Gebühren des EUIPO (Amt der Europäischen Union für geistiges Eigentum) für Unionsmarken.
export const euipoFees: EuipoFees = {
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
  verified: true,
};
