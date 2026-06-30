export type Currency = "EUR" | "CHF";

export interface FeeMeta {
  asOf: string;
  sourceUrl: string;
  verified: boolean;
  note?: string;
}

export interface DpmaFees extends FeeMeta {
  applicationElectronic: number;
  applicationPaper: number;
  classesIncluded: number;
  additionalClassFee: number;
  acceleratedExamination: number;
  renewalBase: number;
  renewalClassesIncluded: number;
  renewalAdditionalClassFee: number;
  oppositionFee: number;
}

export interface EuipoFees extends FeeMeta {
  applicationElectronicClass1: number;
  applicationElectronicClass2: number;
  applicationElectronicClass3Plus: number;
  applicationPaperClass1: number;
  renewalClass1: number;
  renewalClass2: number;
  renewalClass3Plus: number;
  oppositionFee: number;
}

export interface WipoBaseFees extends FeeMeta {
  basicFeeBW: number;
  basicFeeColor: number;
  classesIncluded: number;
  supplementaryClassFee: number;
  complementaryFee: number;
}

export interface WipoMemberIndividualFee {
  class1: number;
  class2to3?: number;
  class4Plus?: number;
  renewal?: number;
}

export interface WipoMember {
  code: string;
  name: string;
  feeType: "complementary" | "individual";
  verified: boolean;
  individualFee?: WipoMemberIndividualFee;
  note?: string;
}
