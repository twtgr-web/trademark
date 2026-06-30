import { LineItem } from "@/lib/fees/calculate";

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-zinc-700 dark:text-zinc-300">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
      />
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-zinc-700 dark:text-zinc-300">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
      />
    </label>
  );
}

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: "application" | "renewal";
  onChange: (mode: "application" | "renewal") => void;
}) {
  return (
    <div className="flex rounded-md border border-zinc-300 text-sm dark:border-zinc-700">
      {(["application", "renewal"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 px-3 py-1.5 ${
            mode === m
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-transparent text-zinc-600 dark:text-zinc-400"
          } first:rounded-l-md last:rounded-r-md`}
        >
          {m === "application" ? "Anmeldung" : "Verlängerung"}
        </button>
      ))}
    </div>
  );
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
}

export function LineItemsTable({ items, currency }: { items: LineItem[]; currency: "EUR" | "CHF" }) {
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">Keine Gebühren ausgewählt.</p>;
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
            <td className="py-1.5 text-zinc-600 dark:text-zinc-400">{item.label}</td>
            <td className="py-1.5 text-right tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatAmount(item.amount, item.currency)}
            </td>
          </tr>
        ))}
        <tr>
          <td className="pt-2 font-semibold text-zinc-900 dark:text-zinc-50">Zwischensumme</td>
          <td className="pt-2 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatAmount(total, currency)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export { formatAmount };
