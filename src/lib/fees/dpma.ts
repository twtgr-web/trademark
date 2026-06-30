import { DpmaFees } from "./types";

// Amtliche Gebühren des Deutschen Patent- und Markenamts (DPMA) für Markenanmeldungen.
export const dpmaFees: DpmaFees = {
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
  verified: true,
};
