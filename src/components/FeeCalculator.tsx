"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateAttorneyFees,
  calculateDpma,
  calculateEuipo,
  calculateWipo,
  sumItems,
} from "@/lib/fees/calculate";
import { dpmaFees } from "@/lib/fees/dpma";
import { euipoFees } from "@/lib/fees/euipo";
import { wipoBaseFees, wipoMembers } from "@/lib/fees/wipo";
import { attorneyFeeItems as defaultAttorneyFeeItems, AttorneyFeeItem } from "@/lib/fees/attorney";
import { Card, formatAmount, LineItemsTable, ModeToggle, NumberField, ToggleField } from "@/components/ui";

const STORAGE_KEY = "trademark-fee-calculator:attorney-fees";

function loadAttorneyItems(): AttorneyFeeItem[] {
  if (typeof window === "undefined") return defaultAttorneyFeeItems;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAttorneyFeeItems;
    const saved = JSON.parse(raw) as AttorneyFeeItem[];
    return defaultAttorneyFeeItems.map((item) => saved.find((s) => s.id === item.id) ?? item);
  } catch {
    return defaultAttorneyFeeItems;
  }
}

export default function FeeCalculator() {
  const [classes, setClasses] = useState(3);
  const [exchangeRate, setExchangeRate] = useState(1.06);

  const [dpmaEnabled, setDpmaEnabled] = useState(true);
  const [dpmaMode, setDpmaMode] = useState<"application" | "renewal">("application");
  const [dpmaElectronic, setDpmaElectronic] = useState(true);
  const [dpmaAccelerated, setDpmaAccelerated] = useState(false);
  const [dpmaOpposition, setDpmaOpposition] = useState(false);

  const [euipoEnabled, setEuipoEnabled] = useState(true);
  const [euipoMode, setEuipoMode] = useState<"application" | "renewal">("application");
  const [euipoElectronic, setEuipoElectronic] = useState(true);
  const [euipoOpposition, setEuipoOpposition] = useState(false);

  const [wipoEnabled, setWipoEnabled] = useState(false);
  const [wipoMode, setWipoMode] = useState<"application" | "renewal">("application");
  const [wipoColor, setWipoColor] = useState(false);
  const [wipoCountries, setWipoCountries] = useState<string[]>([]);
  const [wipoOverrides, setWipoOverrides] = useState<Record<string, number>>({});

  const [attorneyItems, setAttorneyItems] = useState<AttorneyFeeItem[]>(loadAttorneyItems);
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attorneyItems));
  }, [attorneyItems]);

  const dpmaItems = useMemo(
    () =>
      dpmaEnabled
        ? calculateDpma({
            classes,
            electronic: dpmaElectronic,
            accelerated: dpmaAccelerated,
            opposition: dpmaOpposition,
            mode: dpmaMode,
          })
        : [],
    [dpmaEnabled, classes, dpmaElectronic, dpmaAccelerated, dpmaOpposition, dpmaMode]
  );

  const euipoItems = useMemo(
    () =>
      euipoEnabled
        ? calculateEuipo({ classes, electronic: euipoElectronic, opposition: euipoOpposition, mode: euipoMode })
        : [],
    [euipoEnabled, classes, euipoElectronic, euipoOpposition, euipoMode]
  );

  const wipoItems = useMemo(
    () =>
      wipoEnabled
        ? calculateWipo({
            classes,
            color: wipoColor,
            mode: wipoMode,
            designatedMemberCodes: wipoCountries,
            memberFeeOverrides: wipoOverrides,
          })
        : [],
    [wipoEnabled, classes, wipoColor, wipoMode, wipoCountries, wipoOverrides]
  );

  const attorneyComputed = useMemo(
    () =>
      calculateAttorneyFees(
        attorneyItems,
        { dpma: classes, euipo: classes, wipo: classes },
        wipoCountries.length
      ),
    [attorneyItems, classes, wipoCountries.length]
  );

  const dpmaTotal = sumItems(dpmaItems, "EUR");
  const euipoTotal = sumItems(euipoItems, "EUR");
  const wipoTotalChf = sumItems(wipoItems, "CHF");
  const wipoTotalEur = wipoTotalChf * exchangeRate;
  const attorneyTotal = sumItems(attorneyComputed, "EUR");
  const officialTotal = dpmaTotal + euipoTotal + wipoTotalEur;
  const grandTotal = officialTotal + attorneyTotal;

  function toggleCountry(code: string) {
    setWipoCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function updateAttorneyAmount(id: string, amount: number) {
    setAttorneyItems((prev) => prev.map((item) => (item.id === id ? { ...item, amount } : item)));
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Gebührenrechner für Markenanmeldungen
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Amtliche Gebühren von DPMA, EUIPO und WIPO (Madrider System) sowie patentanwaltliche Gebühren auf einen
          Blick. Alle Werte sind Schätzungen und ersetzen keine verbindliche Auskunft.
        </p>
      </header>

      <Card title="Allgemeine Angaben">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Anzahl Waren-/Dienstleistungsklassen" value={classes} onChange={setClasses} min={1} />
          <NumberField
            label="Wechselkurs CHF → EUR"
            value={exchangeRate}
            onChange={setExchangeRate}
            min={0}
            step={0.01}
          />
        </div>
        <p className="text-xs text-zinc-400">
          Die Klassenzahl gilt einheitlich für DPMA, EUIPO und WIPO. Der Wechselkurs dient nur der Umrechnung der
          CHF-Gebühren der WIPO für die Gesamtsumme und kann manuell angepasst werden.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="DPMA (Deutschland)"
          subtitle={`Stand ${dpmaFees.asOf} · dpma.de`}
        >
          <ToggleField label="Berücksichtigen" checked={dpmaEnabled} onChange={setDpmaEnabled} />
          {dpmaEnabled && (
            <>
              <ModeToggle mode={dpmaMode} onChange={setDpmaMode} />
              {dpmaMode === "application" && (
                <>
                  <ToggleField label="Elektronische Anmeldung" checked={dpmaElectronic} onChange={setDpmaElectronic} />
                  <ToggleField label="Beschleunigte Prüfung beantragen" checked={dpmaAccelerated} onChange={setDpmaAccelerated} />
                </>
              )}
              <ToggleField label="Widerspruchsverfahren" checked={dpmaOpposition} onChange={setDpmaOpposition} />
              <LineItemsTable items={dpmaItems} currency="EUR" />
            </>
          )}
        </Card>

        <Card title="EUIPO (Unionsmarke)" subtitle={`Stand ${euipoFees.asOf} · euipo.europa.eu`}>
          <ToggleField label="Berücksichtigen" checked={euipoEnabled} onChange={setEuipoEnabled} />
          {euipoEnabled && (
            <>
              <ModeToggle mode={euipoMode} onChange={setEuipoMode} />
              {euipoMode === "application" && (
                <ToggleField label="Elektronische Anmeldung" checked={euipoElectronic} onChange={setEuipoElectronic} />
              )}
              <ToggleField label="Widerspruchsverfahren" checked={euipoOpposition} onChange={setEuipoOpposition} />
              <LineItemsTable items={euipoItems} currency="EUR" />
            </>
          )}
        </Card>

        <Card title="WIPO (Madrider System)" subtitle={`Stand ${wipoBaseFees.asOf} · wipo.int`}>
          <ToggleField label="Berücksichtigen" checked={wipoEnabled} onChange={setWipoEnabled} />
          {wipoEnabled && (
            <>
              <ModeToggle mode={wipoMode} onChange={setWipoMode} />
              {wipoMode === "application" && (
                <ToggleField label="Marke in Farbe" checked={wipoColor} onChange={setWipoColor} />
              )}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Benannte Länder</p>
                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
                  {wipoMembers.map((member) => {
                    const checked = wipoCountries.includes(member.code);
                    return (
                      <div key={member.code} className="flex items-center justify-between gap-2 text-sm">
                        <label className="flex flex-1 items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCountry(member.code)}
                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                          />
                          <span>{member.name}</span>
                          {!member.verified && (
                            <span
                              title="Schätzwert, bitte vor Nutzung prüfen"
                              className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            >
                              ⚠ prüfen
                            </span>
                          )}
                        </label>
                        {checked && (
                          <input
                            type="number"
                            value={wipoOverrides[member.code] ?? ""}
                            placeholder="CHF auto"
                            onChange={(e) =>
                              setWipoOverrides((prev) => ({
                                ...prev,
                                [member.code]: e.target.value === "" ? undefined : Number(e.target.value),
                              }) as Record<string, number>)
                            }
                            className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <LineItemsTable items={wipoItems} currency="CHF" />
              {wipoItems.length > 0 && (
                <p className="text-xs text-zinc-400">
                  ≈ {formatAmount(wipoTotalChf * exchangeRate, "EUR")} bei Kurs {exchangeRate}
                </p>
              )}
            </>
          )}
        </Card>
      </div>

      <Card
        title="Patentanwaltliche Gebühren"
        subtitle="Platzhalter – bitte mit den tatsächlichen Sätzen befüllen. Änderungen werden lokal im Browser gespeichert."
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {attorneyItems.map((item) => (
            <NumberField
              key={item.id}
              label={`${item.label}${item.perClass ? " (je Klasse)" : ""}`}
              value={item.amount}
              onChange={(v) => updateAttorneyAmount(item.id, v)}
            />
          ))}
        </div>
        <LineItemsTable items={attorneyComputed} currency="EUR" />
      </Card>

      <Card title="Gesamtübersicht">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5">DPMA</td>
              <td className="py-1.5 text-right tabular-nums">{formatAmount(dpmaTotal, "EUR")}</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5">EUIPO</td>
              <td className="py-1.5 text-right tabular-nums">{formatAmount(euipoTotal, "EUR")}</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5">
                WIPO <span className="text-xs text-zinc-400">({formatAmount(wipoTotalChf, "CHF")})</span>
              </td>
              <td className="py-1.5 text-right tabular-nums">{formatAmount(wipoTotalEur, "EUR")}</td>
            </tr>
            <tr className="border-b border-zinc-200 font-medium dark:border-zinc-700">
              <td className="py-1.5">Amtliche Gebühren gesamt</td>
              <td className="py-1.5 text-right tabular-nums">{formatAmount(officialTotal, "EUR")}</td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5">Patentanwaltliche Gebühren</td>
              <td className="py-1.5 text-right tabular-nums">{formatAmount(attorneyTotal, "EUR")}</td>
            </tr>
            <tr>
              <td className="pt-2 text-base font-bold text-zinc-900 dark:text-zinc-50">Gesamtsumme</td>
              <td className="pt-2 text-right text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatAmount(grandTotal, "EUR")}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <footer className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <p className="font-medium text-zinc-600 dark:text-zinc-300">Hinweise zu den Daten</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>
            DPMA: Amtliche Gebühren, Stand {dpmaFees.asOf} ({dpmaFees.sourceUrl}).
          </li>
          <li>
            EUIPO: Amtliche Gebühren, Stand {euipoFees.asOf} ({euipoFees.sourceUrl}).
          </li>
          <li>
            WIPO: Grundgebühren amtlich, Stand {wipoBaseFees.asOf} ({wipoBaseFees.sourceUrl}). Mit ⚠ markierte
            Benennungsgebühren sind ungeprüfte Schätzwerte – bitte vor verbindlicher Nutzung gegen den{" "}
            <a
              className="underline"
              href="https://madrid.wipo.int/feecalcapp/"
              target="_blank"
              rel="noreferrer"
            >
              WIPO Fee Calculator
            </a>{" "}
            prüfen.
          </li>
          <li>Patentanwaltliche Gebühren sind Platzhalter (0 €), bis konkrete Sätze hinterlegt werden.</li>
          <li>Dieser Rechner dient der Orientierung und stellt keine Rechtsberatung dar.</li>
        </ul>
      </footer>
    </div>
  );
}
