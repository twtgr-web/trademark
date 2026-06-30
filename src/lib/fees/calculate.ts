import { dpmaFees } from "./dpma";
import { euipoFees } from "./euipo";
import { wipoBaseFees, wipoMembers } from "./wipo";
import { AttorneyFeeItem } from "./attorney";
import { Currency } from "./types";

export interface LineItem {
  label: string;
  amount: number;
  currency: Currency;
}

export interface DpmaInput {
  classes: number;
  electronic: boolean;
  accelerated: boolean;
  opposition: boolean;
  mode: "application" | "renewal";
}

export function calculateDpma(input: DpmaInput): LineItem[] {
  const items: LineItem[] = [];
  const classes = Math.max(1, input.classes);

  if (input.mode === "application") {
    items.push({
      label: input.electronic
        ? `Anmeldegebühr elektronisch (bis ${dpmaFees.classesIncluded} Klassen)`
        : `Anmeldegebühr Papier (bis ${dpmaFees.classesIncluded} Klassen)`,
      amount: input.electronic ? dpmaFees.applicationElectronic : dpmaFees.applicationPaper,
      currency: "EUR",
    });
    const extra = Math.max(0, classes - dpmaFees.classesIncluded);
    if (extra > 0) {
      items.push({
        label: `Klassengebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${dpmaFees.additionalClassFee} €)`,
        amount: extra * dpmaFees.additionalClassFee,
        currency: "EUR",
      });
    }
    if (input.accelerated) {
      items.push({ label: "Beschleunigte Prüfung", amount: dpmaFees.acceleratedExamination, currency: "EUR" });
    }
  } else {
    items.push({
      label: `Verlängerungsgebühr (bis ${dpmaFees.renewalClassesIncluded} Klassen)`,
      amount: dpmaFees.renewalBase,
      currency: "EUR",
    });
    const extra = Math.max(0, classes - dpmaFees.renewalClassesIncluded);
    if (extra > 0) {
      items.push({
        label: `Klassengebühr Verlängerung (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${dpmaFees.renewalAdditionalClassFee} €)`,
        amount: extra * dpmaFees.renewalAdditionalClassFee,
        currency: "EUR",
      });
    }
  }

  if (input.opposition) {
    items.push({ label: "Widerspruchsgebühr", amount: dpmaFees.oppositionFee, currency: "EUR" });
  }

  return items;
}

export interface EuipoInput {
  classes: number;
  electronic: boolean;
  opposition: boolean;
  mode: "application" | "renewal";
}

export function calculateEuipo(input: EuipoInput): LineItem[] {
  const items: LineItem[] = [];
  const classes = Math.max(1, input.classes);
  const isApplication = input.mode === "application";

  const class1Fee = isApplication
    ? input.electronic
      ? euipoFees.applicationElectronicClass1
      : euipoFees.applicationPaperClass1
    : euipoFees.renewalClass1;
  const class2Fee = isApplication ? euipoFees.applicationElectronicClass2 : euipoFees.renewalClass2;
  const class3PlusFee = isApplication ? euipoFees.applicationElectronicClass3Plus : euipoFees.renewalClass3Plus;

  items.push({
    label: `${isApplication ? "Grundgebühr" : "Verlängerungsgrundgebühr"} (1. Klasse${
      isApplication && !input.electronic ? ", Papieranmeldung" : ""
    })`,
    amount: class1Fee,
    currency: "EUR",
  });

  if (classes >= 2) {
    items.push({ label: "Gebühr für die 2. Klasse", amount: class2Fee, currency: "EUR" });
  }
  if (classes >= 3) {
    const extraClasses = classes - 2;
    items.push({
      label: `Gebühr ab der 3. Klasse (${extraClasses} Klasse${extraClasses > 1 ? "n" : ""} à ${class3PlusFee} €)`,
      amount: extraClasses * class3PlusFee,
      currency: "EUR",
    });
  }

  if (input.opposition) {
    items.push({ label: "Widerspruchsgebühr", amount: euipoFees.oppositionFee, currency: "EUR" });
  }

  return items;
}

export interface WipoInput {
  classes: number;
  color: boolean;
  mode: "application" | "renewal";
  designatedMemberCodes: string[];
  memberFeeOverrides: Record<string, number>;
}

export function calculateWipo(input: WipoInput): LineItem[] {
  const items: LineItem[] = [];
  const classes = Math.max(1, input.classes);

  if (input.mode === "application") {
    items.push({
      label: `Grundgebühr (${input.color ? "Marke in Farbe" : "Schwarz-Weiß"})`,
      amount: input.color ? wipoBaseFees.basicFeeColor : wipoBaseFees.basicFeeBW,
      currency: "CHF",
    });
    const extra = Math.max(0, classes - wipoBaseFees.classesIncluded);
    if (extra > 0) {
      items.push({
        label: `Zusatzgebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${wipoBaseFees.supplementaryClassFee} CHF)`,
        amount: extra * wipoBaseFees.supplementaryClassFee,
        currency: "CHF",
      });
    }
  }

  for (const code of input.designatedMemberCodes) {
    const member = wipoMembers.find((m) => m.code === code);
    if (!member) continue;

    const override = input.memberFeeOverrides[code];
    if (override !== undefined) {
      items.push({ label: `Benennungsgebühr – ${member.name}`, amount: override, currency: "CHF" });
      continue;
    }

    if (member.feeType === "complementary" || !member.individualFee) {
      items.push({
        label: `Komplementärgebühr – ${member.name}`,
        amount: wipoBaseFees.complementaryFee,
        currency: "CHF",
      });
      continue;
    }

    if (input.mode === "renewal" && member.individualFee.renewal !== undefined) {
      items.push({
        label: `Individuelle Verlängerungsgebühr – ${member.name}`,
        amount: member.individualFee.renewal,
        currency: "CHF",
      });
      continue;
    }

    let amount = member.individualFee.class1;
    if (classes >= 2 && member.individualFee.class2to3 !== undefined) {
      amount += Math.min(classes - 1, 2) * member.individualFee.class2to3;
    }
    if (classes >= 4 && member.individualFee.class4Plus !== undefined) {
      amount += (classes - 3) * member.individualFee.class4Plus;
    }
    items.push({ label: `Individuelle Benennungsgebühr – ${member.name}`, amount, currency: "CHF" });
  }

  return items;
}

export function calculateAttorneyFees(
  items: AttorneyFeeItem[],
  classes: { dpma: number; euipo: number; wipo: number },
  designatedCountryCount: number
): LineItem[] {
  return items
    .filter((item) => item.amount > 0)
    .map((item) => {
      if (!item.perClass) {
        if (item.id === "wipo-per-country") {
          return { label: item.label, amount: item.amount * designatedCountryCount, currency: "EUR" as Currency };
        }
        return { label: item.label, amount: item.amount, currency: "EUR" as Currency };
      }
      const classCount = item.office === "general" ? 1 : classes[item.office];
      return {
        label: `${item.label} (${classCount} Klasse${classCount > 1 ? "n" : ""})`,
        amount: item.amount * classCount,
        currency: "EUR" as Currency,
      };
    });
}

export function sumItems(items: LineItem[], currency: Currency): number {
  return items.filter((i) => i.currency === currency).reduce((sum, i) => sum + i.amount, 0);
}
