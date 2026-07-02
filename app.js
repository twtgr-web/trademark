"use strict";

const CASES_STORAGE_KEY = "trademark-fee-calculator:cases";
const LEGACY_ATTORNEY_STORAGE_KEY = "trademark-fee-calculator:attorney-fees";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const chf = new Intl.NumberFormat("de-DE", { style: "currency", currency: "CHF" });
const gbp = new Intl.NumberFormat("de-DE", { style: "currency", currency: "GBP" });

function formatAmount(amount, currency) {
  if (currency === "CHF") return chf.format(amount);
  if (currency === "GBP") return gbp.format(amount);
  return eur.format(amount);
}

// ---------------------------------------------------------------------------
// Berechnungslogik
// ---------------------------------------------------------------------------

function calculateDpma({ classes, electronic, accelerated, opposition, mode }) {
  const items = [];
  const c = Math.max(1, classes);

  if (mode === "application") {
    items.push({
      label: electronic
        ? `Anmeldegebühr elektronisch (bis ${DPMA_FEES.classesIncluded} Klassen)`
        : `Anmeldegebühr Papier (bis ${DPMA_FEES.classesIncluded} Klassen)`,
      amount: electronic ? DPMA_FEES.applicationElectronic : DPMA_FEES.applicationPaper,
      currency: "EUR",
    });
    const extra = Math.max(0, c - DPMA_FEES.classesIncluded);
    if (extra > 0) {
      items.push({
        label: `Klassengebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${DPMA_FEES.additionalClassFee} €)`,
        amount: extra * DPMA_FEES.additionalClassFee,
        currency: "EUR",
      });
    }
    if (accelerated) {
      items.push({ label: "Beschleunigte Prüfung", amount: DPMA_FEES.acceleratedExamination, currency: "EUR" });
    }
  } else {
    items.push({
      label: `Verlängerungsgebühr (bis ${DPMA_FEES.renewalClassesIncluded} Klassen)`,
      amount: DPMA_FEES.renewalBase,
      currency: "EUR",
    });
    const extra = Math.max(0, c - DPMA_FEES.renewalClassesIncluded);
    if (extra > 0) {
      items.push({
        label: `Klassengebühr Verlängerung (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${DPMA_FEES.renewalAdditionalClassFee} €)`,
        amount: extra * DPMA_FEES.renewalAdditionalClassFee,
        currency: "EUR",
      });
    }
  }

  if (opposition) {
    items.push({ label: "Widerspruchsgebühr", amount: DPMA_FEES.oppositionFee, currency: "EUR" });
  }

  return items;
}

function calculateEuipo({ classes, electronic, opposition, mode }) {
  const items = [];
  const c = Math.max(1, classes);
  const isApplication = mode === "application";

  const class1Fee = isApplication
    ? electronic
      ? EUIPO_FEES.applicationElectronicClass1
      : EUIPO_FEES.applicationPaperClass1
    : EUIPO_FEES.renewalClass1;
  const class2Fee = isApplication ? EUIPO_FEES.applicationElectronicClass2 : EUIPO_FEES.renewalClass2;
  const class3PlusFee = isApplication ? EUIPO_FEES.applicationElectronicClass3Plus : EUIPO_FEES.renewalClass3Plus;

  items.push({
    label: `${isApplication ? "Grundgebühr" : "Verlängerungsgrundgebühr"} (1. Klasse${
      isApplication && !electronic ? ", Papieranmeldung" : ""
    })`,
    amount: class1Fee,
    currency: "EUR",
  });

  if (c >= 2) {
    items.push({ label: "Gebühr für die 2. Klasse", amount: class2Fee, currency: "EUR" });
  }
  if (c >= 3) {
    const extraClasses = c - 2;
    items.push({
      label: `Gebühr ab der 3. Klasse (${extraClasses} Klasse${extraClasses > 1 ? "n" : ""} à ${class3PlusFee} €)`,
      amount: extraClasses * class3PlusFee,
      currency: "EUR",
    });
  }

  if (opposition) {
    items.push({ label: "Widerspruchsgebühr", amount: EUIPO_FEES.oppositionFee, currency: "EUR" });
  }

  return items;
}

function calculateWipo({ classes, color, mode, designatedMemberCodes, memberFeeOverrides }) {
  const items = [];
  const c = Math.max(1, classes);

  if (mode === "application") {
    items.push({
      label: `Grundgebühr (${color ? "Marke in Farbe" : "Schwarz-Weiß"})`,
      amount: color ? WIPO_BASE_FEES.basicFeeColor : WIPO_BASE_FEES.basicFeeBW,
      currency: "CHF",
    });
    const extra = Math.max(0, c - WIPO_BASE_FEES.classesIncluded);
    if (extra > 0) {
      items.push({
        label: `Zusatzgebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${WIPO_BASE_FEES.supplementaryClassFee} CHF)`,
        amount: extra * WIPO_BASE_FEES.supplementaryClassFee,
        currency: "CHF",
      });
    }
  }

  for (const code of designatedMemberCodes) {
    const member = WIPO_MEMBERS.find((m) => m.code === code);
    if (!member) continue;

    const override = memberFeeOverrides[code];
    if (override !== undefined && override !== null && !Number.isNaN(override)) {
      items.push({ label: `Benennungsgebühr – ${member.name}`, amount: override, currency: "CHF" });
      continue;
    }

    if (member.feeType === "complementary" || !member.individualFee) {
      items.push({ label: `Komplementärgebühr – ${member.name}`, amount: WIPO_BASE_FEES.complementaryFee, currency: "CHF" });
      continue;
    }

    if (mode === "renewal" && member.individualFee.renewal !== undefined) {
      items.push({ label: `Individuelle Verlängerungsgebühr – ${member.name}`, amount: member.individualFee.renewal, currency: "CHF" });
      continue;
    }

    let amount = member.individualFee.class1;
    if (c >= 2 && member.individualFee.class2to3 !== undefined) {
      amount += Math.min(c - 1, 2) * member.individualFee.class2to3;
    }
    if (c >= 4 && member.individualFee.class4Plus !== undefined) {
      amount += (c - 3) * member.individualFee.class4Plus;
    }
    items.push({ label: `Individuelle Benennungsgebühr – ${member.name}`, amount, currency: "CHF" });
  }

  return items;
}

function calculateUkipoOfficial(classes) {
  const c = Math.max(1, classes);
  const items = [{ label: "Anmeldegebühr (1. Klasse)", amount: UKIPO_FEES.officialClass1, currency: "GBP" }];
  const extra = c - 1;
  if (extra > 0) {
    items.push({
      label: `Klassengebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${UKIPO_FEES.officialAdditionalClassFee} GBP)`,
      amount: extra * UKIPO_FEES.officialAdditionalClassFee,
      currency: "GBP",
    });
  }
  return items;
}

function calculateUkipoAttorney(classes) {
  const c = Math.max(1, classes);
  const items = [{ label: "Service Charge (1. Klasse)", amount: UKIPO_FEES.attorneyClass1, currency: "GBP" }];
  const extra = c - 1;
  if (extra > 0) {
    items.push({
      label: `Service Charge (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${UKIPO_FEES.attorneyAdditionalClassFee} GBP)`,
      amount: extra * UKIPO_FEES.attorneyAdditionalClassFee,
      currency: "GBP",
    });
  }
  return items;
}

function calculateChOfficial(classes) {
  const c = Math.max(1, classes);
  const items = [{ label: "Anmeldegebühr (inkl. 3 Klassen)", amount: CH_FEES.officialClass1to3, currency: "CHF" }];
  const extra = Math.max(0, c - 3);
  if (extra > 0) {
    items.push({
      label: `Klassengebühr (${extra} weitere Klasse${extra > 1 ? "n" : ""} à ${CH_FEES.officialAdditionalClassFee} CHF)`,
      amount: extra * CH_FEES.officialAdditionalClassFee,
      currency: "CHF",
    });
  }
  return items;
}

function calculateChAttorney() {
  return [{ label: "Vertreterhonorar vor Ort (Pauschale)", amount: CH_FEES.attorneyLocalFee, currency: "CHF" }];
}

function calculateAttorneyFees(items, classes, designatedCountryCount) {
  return items
    .filter((item) => item.enabled && item.amount > 0)
    .map((item) => {
      if (item.scope === "perExtraClass") {
        const extra = Math.max(0, classes - 3);
        if (extra === 0) return null;
        return {
          label: `${item.label} (${extra} Klasse${extra > 1 ? "n" : ""})`,
          amount: item.amount * extra,
          currency: "EUR",
        };
      }
      if (item.scope === "perCountry") {
        if (designatedCountryCount === 0) return null;
        return {
          label: `${item.label} (${designatedCountryCount} Land/Länder)`,
          amount: item.amount * designatedCountryCount,
          currency: "EUR",
        };
      }
      return { label: item.label, amount: item.amount, currency: "EUR" };
    })
    .filter(Boolean);
}

function calculateWipoDesignationAttorneyFees(designatedMemberCodes, mode, overrides) {
  const items = [];
  for (const code of designatedMemberCodes) {
    const member = WIPO_MEMBERS.find((m) => m.code === code);
    if (!member) continue;
    const override = overrides[code];
    if (override !== undefined && override !== null && !Number.isNaN(override)) {
      items.push({ label: `Benennungshonorar – ${member.name}`, amount: override, currency: "EUR" });
      continue;
    }
    const fee =
      mode === "renewal"
        ? member.attorneyRenewalDesignationFee ?? ATTORNEY_DEFAULT_RENEWAL_DESIGNATION_FEE_EUR
        : member.attorneyDesignationFee ?? ATTORNEY_DEFAULT_DESIGNATION_FEE_EUR;
    items.push({ label: `Benennungshonorar – ${member.name}`, amount: fee, currency: "EUR" });
  }
  return items;
}

function calculateLocalAttorneyFees(designatedMemberCodes, overrides) {
  const items = [];
  for (const code of designatedMemberCodes) {
    const member = WIPO_MEMBERS.find((m) => m.code === code);
    if (!member) continue;
    const override = overrides[code];
    if (override !== undefined && override !== null && !Number.isNaN(override)) {
      items.push({ label: `Honorar Patentanwalt vor Ort – ${member.name}`, amount: override, currency: "CHF" });
      continue;
    }
    if (!member.localAttorneyFee) continue;
    items.push({
      label: `Honorar Patentanwalt vor Ort – ${member.name}`,
      amount: member.localAttorneyFee.amount,
      currency: member.localAttorneyFee.currency,
    });
  }
  return items;
}

function sumItems(items, currency) {
  return items.filter((i) => i.currency === currency).reduce((sum, i) => sum + i.amount, 0);
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function createDefaultAttorneyItems() {
  return ATTORNEY_FEE_ITEMS.map((i) => ({ ...i }));
}

// Liest die vor der Mehrfach-Fälle-Verwaltung verwendete, einzelne Honorar-Speicherung
// (falls vorhanden), damit bestehende Anpassungen beim ersten Laden als Startpunkt für
// "Fall 1" übernommen werden, statt verloren zu gehen.
function loadLegacyAttorneyItems() {
  try {
    const raw = window.localStorage.getItem(LEGACY_ATTORNEY_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return ATTORNEY_FEE_ITEMS.map((item) => {
      const match = saved.find((s) => s.id === item.id);
      return match ? { ...item, amount: Number(match.amount) || 0, enabled: Boolean(match.enabled) } : { ...item };
    });
  } catch {
    return null;
  }
}

function createDefaultCaseState(attorneyItems) {
  return {
    reportTitle: "",
    classes: 3,
    exchangeRate: 1.06,
    gbpExchangeRate: 1.17,

    dpmaEnabled: true,
    dpmaMode: "application",
    dpmaElectronic: true,
    dpmaAccelerated: false,
    dpmaOpposition: false,

    euipoEnabled: true,
    euipoMode: "application",
    euipoElectronic: true,
    euipoOpposition: false,

    wipoEnabled: false,
    wipoMode: "application",
    wipoColor: false,
    wipoCountries: [],
    wipoOverrides: {},
    wipoAttorneyDesignationOverrides: {},
    wipoLocalAttorneyOverrides: {},

    ukipoEnabled: false,
    chEnabled: false,

    attorneyItems: attorneyItems || createDefaultAttorneyItems(),
    attorneyVatEnabled: true,
    attorneyVatRate: ATTORNEY_VAT_RATE_DEFAULT,

    clientView: false,
  };
}

function generateCaseId() {
  return "case-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function loadCasesFromStorage() {
  try {
    const raw = window.localStorage.getItem(CASES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.cases) && parsed.cases.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fällt unten auf einen frischen Standard-Fall zurück.
  }

  const initialCase = { id: generateCaseId(), state: createDefaultCaseState(loadLegacyAttorneyItems()) };
  return { activeCaseId: initialCase.id, cases: [initialCase] };
}

const casesData = loadCasesFromStorage();
const cases = casesData.cases;
let activeCaseId = cases.some((c) => c.id === casesData.activeCaseId) ? casesData.activeCaseId : cases[0].id;
let state = cases.find((c) => c.id === activeCaseId).state;

function persistCases() {
  window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify({ activeCaseId, cases }));
}

function caseLabel(c) {
  return (c.state.reportTitle && c.state.reportTitle.trim()) || `Fall ${cases.indexOf(c) + 1}`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderLineItemsTable(container, items, currency) {
  container.innerHTML = "";
  if (items.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-hint";
    p.textContent = "Keine Gebühren ausgewählt.";
    container.appendChild(p);
    return;
  }
  const table = document.createElement("table");
  table.className = "line-items";
  const tbody = document.createElement("tbody");
  let total = 0;
  for (const item of items) {
    total += item.amount;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.label}</td><td class="amount">${formatAmount(item.amount, item.currency)}</td>`;
    tbody.appendChild(tr);
  }
  const totalRow = document.createElement("tr");
  totalRow.className = "subtotal";
  totalRow.innerHTML = `<td>Zwischensumme</td><td class="amount">${formatAmount(total, currency)}</td>`;
  tbody.appendChild(totalRow);
  table.appendChild(tbody);
  container.appendChild(table);
}

function createOverrideField(labelText, placeholder, value, onInput, extraClass) {
  const wrap = document.createElement("label");
  wrap.className = "override-field" + (extraClass ? " " + extraClass : "");
  const span = document.createElement("span");
  span.textContent = labelText;
  const input = document.createElement("input");
  input.type = "number";
  input.className = "override-input";
  input.placeholder = placeholder;
  input.value = value ?? "";
  input.addEventListener("input", () => {
    const v = input.value === "" ? undefined : Number(input.value);
    onInput(v);
  });
  wrap.appendChild(span);
  wrap.appendChild(input);
  return wrap;
}

function renderWipoCountryList() {
  const container = document.getElementById("wipo-countries");
  container.innerHTML = "";
  for (const member of WIPO_MEMBERS) {
    const row = document.createElement("div");
    row.className = "country-row";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.wipoCountries.includes(member.code);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.wipoCountries.push(member.code);
      } else {
        state.wipoCountries = state.wipoCountries.filter((c) => c !== member.code);
        delete state.wipoOverrides[member.code];
        delete state.wipoAttorneyDesignationOverrides[member.code];
        delete state.wipoLocalAttorneyOverrides[member.code];
      }
      render();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + member.name));
    if (!member.verified) {
      const badge = document.createElement("span");
      badge.className = "badge-warn";
      badge.title = member.note || "Schätzwert, bitte vor Nutzung prüfen";
      badge.textContent = "⚠ prüfen";
      label.appendChild(badge);
    }
    row.appendChild(label);

    if (checkbox.checked) {
      const fields = document.createElement("div");
      fields.className = "country-override-fields";

      fields.appendChild(
        createOverrideField("Amt", "CHF auto", state.wipoOverrides[member.code], (v) => {
          if (v === undefined) delete state.wipoOverrides[member.code];
          else state.wipoOverrides[member.code] = v;
          renderWipoResults();
          renderSummary();
        })
      );
      fields.appendChild(
        createOverrideField("Honorar Best.", "EUR auto", state.wipoAttorneyDesignationOverrides[member.code], (v) => {
          if (v === undefined) delete state.wipoAttorneyDesignationOverrides[member.code];
          else state.wipoAttorneyDesignationOverrides[member.code] = v;
          renderAttorneyResults();
          renderSummary();
        })
      );
      fields.appendChild(
        createOverrideField(
          "Vor Ort (CHF)",
          "betrag",
          state.wipoLocalAttorneyOverrides[member.code],
          (v) => {
            if (v === undefined) delete state.wipoLocalAttorneyOverrides[member.code];
            else state.wipoLocalAttorneyOverrides[member.code] = v;
            renderAttorneyResults();
            renderSummary();
          },
          "vor-ort-field"
        )
      );

      row.appendChild(fields);
    }

    container.appendChild(row);
  }
}

function renderAttorneyInputs() {
  const container = document.getElementById("attorney-inputs");
  container.innerHTML = "";
  const scopeSuffix = { perExtraClass: " (je Klasse ab der 4.)", perCountry: " (je benanntem Land)" };
  let currentGroup = null;
  let groupGrid = null;
  for (const item of state.attorneyItems) {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      const heading = document.createElement("p");
      heading.className = "field-label attorney-group-heading";
      heading.textContent = currentGroup;
      container.appendChild(heading);
      groupGrid = document.createElement("div");
      groupGrid.className = "grid-2";
      container.appendChild(groupGrid);
    }
    const field = document.createElement("label");
    field.className = "field attorney-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(item.enabled);
    checkbox.addEventListener("change", () => {
      item.enabled = checkbox.checked;
      renderAttorneyResults();
      renderSummary();
    });

    const span = document.createElement("span");
    span.textContent = item.label + (scopeSuffix[item.scope] || "");

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = item.amount;
    input.addEventListener("input", () => {
      item.amount = Number(input.value) || 0;
      renderAttorneyResults();
      renderSummary();
    });

    field.appendChild(checkbox);
    field.appendChild(span);
    field.appendChild(input);
    groupGrid.appendChild(field);
  }
}

let lastDpmaItems = [];
let lastEuipoItems = [];
let lastWipoItems = [];
let lastUkipoOfficialItems = [];
let lastUkipoAttorneyItems = [];
let lastChOfficialItems = [];
let lastChAttorneyItems = [];
let lastAttorneyItems = [];
let lastLocalAttorneyItems = [];

function renderDpmaResults() {
  lastDpmaItems = state.dpmaEnabled
    ? calculateDpma({
        classes: state.classes,
        electronic: state.dpmaElectronic,
        accelerated: state.dpmaAccelerated,
        opposition: state.dpmaOpposition,
        mode: state.dpmaMode,
      })
    : [];
  renderLineItemsTable(document.getElementById("dpma-results"), lastDpmaItems, "EUR");
}

function renderEuipoResults() {
  lastEuipoItems = state.euipoEnabled
    ? calculateEuipo({
        classes: state.classes,
        electronic: state.euipoElectronic,
        opposition: state.euipoOpposition,
        mode: state.euipoMode,
      })
    : [];
  renderLineItemsTable(document.getElementById("euipo-results"), lastEuipoItems, "EUR");
}

function renderWipoResults() {
  lastWipoItems = state.wipoEnabled
    ? calculateWipo({
        classes: state.classes,
        color: state.wipoColor,
        mode: state.wipoMode,
        designatedMemberCodes: state.wipoCountries,
        memberFeeOverrides: state.wipoOverrides,
      })
    : [];
  renderLineItemsTable(document.getElementById("wipo-results"), lastWipoItems, "CHF");
  const chfTotal = sumItems(lastWipoItems, "CHF");
  const hint = document.getElementById("wipo-eur-hint");
  if (lastWipoItems.length > 0) {
    hint.textContent = `≈ ${formatAmount(chfTotal * state.exchangeRate, "EUR")} bei Kurs ${state.exchangeRate}`;
    hint.style.display = "block";
  } else {
    hint.style.display = "none";
  }
}

function renderUkipoResults() {
  lastUkipoOfficialItems = state.ukipoEnabled ? calculateUkipoOfficial(state.classes) : [];
  lastUkipoAttorneyItems = state.ukipoEnabled ? calculateUkipoAttorney(state.classes) : [];
  renderLineItemsTable(document.getElementById("ukipo-official-results"), lastUkipoOfficialItems, "GBP");
  renderLineItemsTable(document.getElementById("ukipo-attorney-results"), lastUkipoAttorneyItems, "GBP");

  const gbpTotal = sumItems(lastUkipoOfficialItems, "GBP") + sumItems(lastUkipoAttorneyItems, "GBP");
  const hint = document.getElementById("ukipo-eur-hint");
  if (lastUkipoOfficialItems.length > 0) {
    hint.textContent = `≈ ${formatAmount(gbpTotal * state.gbpExchangeRate, "EUR")} bei Kurs ${state.gbpExchangeRate} (Amt + Anwalt vor Ort)`;
    hint.style.display = "block";
  } else {
    hint.style.display = "none";
  }
}

function renderChResults() {
  lastChOfficialItems = state.chEnabled ? calculateChOfficial(state.classes) : [];
  lastChAttorneyItems = state.chEnabled ? calculateChAttorney() : [];
  renderLineItemsTable(document.getElementById("ch-official-results"), lastChOfficialItems, "CHF");
  renderLineItemsTable(document.getElementById("ch-attorney-results"), lastChAttorneyItems, "CHF");

  const chfTotal = sumItems(lastChOfficialItems, "CHF") + sumItems(lastChAttorneyItems, "CHF");
  const hint = document.getElementById("ch-eur-hint");
  if (lastChOfficialItems.length > 0) {
    hint.textContent = `≈ ${formatAmount(chfTotal * state.exchangeRate, "EUR")} bei Kurs ${state.exchangeRate} (Amt + Vertreterhonorar)`;
    hint.style.display = "block";
  } else {
    hint.style.display = "none";
  }
}

function renderAttorneyResults() {
  const computedItems = calculateAttorneyFees(state.attorneyItems, state.classes, state.wipoCountries.length);
  const designationItems = state.wipoEnabled
    ? calculateWipoDesignationAttorneyFees(state.wipoCountries, state.wipoMode, state.wipoAttorneyDesignationOverrides)
    : [];
  lastAttorneyItems = [...computedItems, ...designationItems];
  renderLineItemsTable(document.getElementById("attorney-results"), lastAttorneyItems, "EUR");

  lastLocalAttorneyItems = state.wipoEnabled
    ? calculateLocalAttorneyFees(state.wipoCountries, state.wipoLocalAttorneyOverrides)
    : [];
  renderLineItemsTable(document.getElementById("attorney-local-results"), lastLocalAttorneyItems, "CHF");

  const net = sumItems(lastAttorneyItems, "EUR");
  const vat = state.attorneyVatEnabled ? net * (state.attorneyVatRate / 100) : 0;
  const gross = net + vat;

  const breakdown = document.getElementById("attorney-vat-breakdown");
  breakdown.innerHTML = "";
  if (lastAttorneyItems.length > 0) {
    const table = document.createElement("table");
    table.className = "line-items";
    table.innerHTML = `
      <tbody>
        <tr><td>Nettosumme</td><td class="amount">${formatAmount(net, "EUR")}</td></tr>
        <tr><td>zzgl. USt. (${state.attorneyVatEnabled ? state.attorneyVatRate : 0}%)</td><td class="amount">${formatAmount(vat, "EUR")}</td></tr>
        <tr class="subtotal"><td>Bruttosumme</td><td class="amount">${formatAmount(gross, "EUR")}</td></tr>
      </tbody>`;
    breakdown.appendChild(table);
  }
}

function renderSummary() {
  const dpmaTotal = sumItems(lastDpmaItems, "EUR");
  const euipoTotal = sumItems(lastEuipoItems, "EUR");
  const wipoTotalChf = sumItems(lastWipoItems, "CHF");
  const wipoTotalEur = wipoTotalChf * state.exchangeRate;
  const ukipoOfficialGbp = sumItems(lastUkipoOfficialItems, "GBP");
  const ukipoOfficialEur = ukipoOfficialGbp * state.gbpExchangeRate;
  const ukipoAttorneyGbp = sumItems(lastUkipoAttorneyItems, "GBP");
  const ukipoAttorneyEur = ukipoAttorneyGbp * state.gbpExchangeRate;
  const chOfficialChf = sumItems(lastChOfficialItems, "CHF");
  const chOfficialEur = chOfficialChf * state.exchangeRate;
  const chAttorneyChf = sumItems(lastChAttorneyItems, "CHF");
  const attorneyNet = sumItems(lastAttorneyItems, "EUR");
  const attorneyVat = state.attorneyVatEnabled ? attorneyNet * (state.attorneyVatRate / 100) : 0;
  const localAttorneyChf = sumItems(lastLocalAttorneyItems, "CHF") + chAttorneyChf;
  const localAttorneyEur = localAttorneyChf * state.exchangeRate + ukipoAttorneyEur;
  const officialTotal = dpmaTotal + euipoTotal + wipoTotalEur + ukipoOfficialEur + chOfficialEur;
  const grandTotal = officialTotal + attorneyNet + attorneyVat + localAttorneyEur;

  document.getElementById("summary-dpma").textContent = formatAmount(dpmaTotal, "EUR");
  document.getElementById("summary-euipo").textContent = formatAmount(euipoTotal, "EUR");
  document.getElementById("summary-wipo").textContent = formatAmount(wipoTotalEur, "EUR");
  document.getElementById("summary-wipo-chf").textContent = `(${formatAmount(wipoTotalChf, "CHF")})`;
  document.getElementById("summary-ukipo").textContent = formatAmount(ukipoOfficialEur, "EUR");
  document.getElementById("summary-ukipo-gbp").textContent = `(${formatAmount(ukipoOfficialGbp, "GBP")})`;
  document.getElementById("summary-ch").textContent = formatAmount(chOfficialEur, "EUR");
  document.getElementById("summary-ch-chf").textContent = `(${formatAmount(chOfficialChf, "CHF")})`;
  document.getElementById("summary-official").textContent = formatAmount(officialTotal, "EUR");
  document.getElementById("summary-attorney-net").textContent = formatAmount(attorneyNet, "EUR");
  document.getElementById("summary-attorney-vat").textContent = formatAmount(attorneyVat, "EUR");
  document.getElementById("summary-vat-rate-label").textContent = `(${state.attorneyVatEnabled ? state.attorneyVatRate : 0}%)`;
  document.getElementById("summary-local-attorney").textContent = formatAmount(localAttorneyEur, "EUR");
  document.getElementById("summary-local-attorney-chf").textContent =
    ukipoAttorneyGbp > 0
      ? `(${formatAmount(localAttorneyChf, "CHF")} + ${formatAmount(ukipoAttorneyGbp, "GBP")}, keine USt.)`
      : `(${formatAmount(localAttorneyChf, "CHF")}, keine USt.)`;
  document.getElementById("summary-total").textContent = formatAmount(grandTotal, "EUR");

  persistCases();
}

function updateWipoBaseMarkWarning() {
  const warning = document.getElementById("wipo-base-mark-warning");
  const needsWarning = state.wipoEnabled && !state.dpmaEnabled && !state.euipoEnabled;
  warning.style.display = needsWarning ? "block" : "none";
}

function calculateComparisonScenarios() {
  // Die Basismarke ist entweder DPMA (bevorzugt, falls beide aktiv sind) oder EUIPO. Ist DPMA
  // die Basis, zählt eine aktivierte EUIPO als Vergleichsziel; ist EUIPO selbst die Basis (weil
  // DPMA nicht aktiv ist), kann sie nicht gleichzeitig Vergleichsziel sein.
  let baseTotal;
  let baseLabel;
  const targets = [];

  if (state.dpmaEnabled) {
    baseTotal = sumItems(lastDpmaItems, "EUR");
    baseLabel = "DPMA";
    if (state.euipoEnabled) {
      targets.push({ label: "EUIPO", directEur: sumItems(lastEuipoItems, "EUR"), madridCode: "EU" });
    }
  } else if (state.euipoEnabled) {
    baseTotal = sumItems(lastEuipoItems, "EUR");
    baseLabel = "EUIPO";
  } else {
    return null;
  }

  if (state.ukipoEnabled) {
    targets.push({ label: "UKIPO", directEur: sumItems(lastUkipoOfficialItems, "GBP") * state.gbpExchangeRate, madridCode: "GB" });
  }
  if (state.chEnabled) {
    targets.push({ label: "Schweiz (IGE)", directEur: sumItems(lastChOfficialItems, "CHF") * state.exchangeRate, madridCode: "CH" });
  }

  if (targets.length === 0) return null;

  const directLabels = targets.map((t) => t.label);
  const directTotal = baseTotal + targets.reduce((sum, t) => sum + t.directEur, 0);

  const madridCodes = targets.map((t) => t.madridCode);
  const madridItems = calculateWipo({
    classes: state.classes,
    color: state.wipoColor,
    mode: "application",
    designatedMemberCodes: madridCodes,
    memberFeeOverrides: {},
  });
  const madridChf = sumItems(madridItems, "CHF");
  const madridEur = madridChf * state.exchangeRate;
  const madridTotal = baseTotal + madridEur;

  return { baseTotal, baseLabel, directLabels, directTotal, madridCodes, madridChf, madridEur, madridTotal };
}

function renderComparison() {
  const container = document.getElementById("comparison-content");
  const scenario = calculateComparisonScenarios();

  if (!scenario) {
    container.innerHTML = `<p class="hint">Aktiviere DPMA und/oder EUIPO (als Basismarke) sowie mindestens ein weiteres Amt (EUIPO, UKIPO oder Schweiz/IGE) als Vergleichsziel, um hier einen Kostenvergleich zwischen Direktanmeldung und IR-Marke über WIPO für dieselbe Länderabdeckung zu sehen.</p>`;
    return;
  }

  const countryNames = scenario.madridCodes
    .map((code) => WIPO_MEMBERS.find((m) => m.code === code)?.name || code)
    .join(" + ");
  const diff = scenario.directTotal - scenario.madridTotal;
  let conclusion;
  if (Math.abs(diff) < 0.01) {
    conclusion = "Beide Wege kosten amtlich etwa gleich viel.";
  } else if (diff > 0) {
    conclusion = `Die IR-Marke über WIPO ist günstiger, um ${formatAmount(diff, "EUR")}.`;
  } else {
    conclusion = `Die Direktanmeldung ist günstiger, um ${formatAmount(-diff, "EUR")}.`;
  }

  container.innerHTML = `
    <p class="hint">
      Vergleich der amtlichen Gebühren (ohne anwaltliches Honorar) für dieselbe Länderabdeckung (${scenario.baseLabel} + ${countryNames}),
      jeweils inklusive ${scenario.baseLabel} als notwendiger Basismarke.
    </p>
    <table class="line-items">
      <tbody>
        <tr>
          <td>Direktanmeldung (${scenario.baseLabel} + ${scenario.directLabels.join(" + ")})</td>
          <td class="amount">${formatAmount(scenario.directTotal, "EUR")}</td>
        </tr>
        <tr>
          <td>IR-Marke über WIPO (Basis ${scenario.baseLabel}, Benennung ${scenario.madridCodes.join("/")})
            <span class="muted small">(${formatAmount(scenario.madridChf, "CHF")})</span>
          </td>
          <td class="amount">${formatAmount(scenario.madridTotal, "EUR")}</td>
        </tr>
        <tr class="subtotal">
          <td>${conclusion}</td>
          <td class="amount"></td>
        </tr>
      </tbody>
    </table>
    <p class="hint">
      Die WIPO-Grundgebühr lohnt sich meist erst ab mehreren zusätzlichen Zielländern, da sie unabhängig von der
      Anzahl benannter Länder einmal anfällt. Bei nur einem zusätzlichen Land wie hier ist die Direktanmeldung oft
      günstiger.
    </p>
  `;
}

function render() {
  renderDpmaResults();
  renderEuipoResults();
  renderUkipoResults();
  renderChResults();
  renderWipoCountryList();
  renderWipoResults();
  renderAttorneyResults();
  updateWipoBaseMarkWarning();
  renderComparison();
  renderSummary();
}

// ---------------------------------------------------------------------------
// Druckansicht
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function describeDpmaOptions() {
  const parts = [state.dpmaMode === "application" ? "Anmeldung" : "Verlängerung"];
  if (state.dpmaMode === "application") {
    parts.push(state.dpmaElectronic ? "elektronisch" : "Papieranmeldung");
    if (state.dpmaAccelerated) parts.push("beschleunigte Prüfung");
  }
  if (state.dpmaOpposition) parts.push("Widerspruchsverfahren");
  return parts.join(" · ");
}

function describeEuipoOptions() {
  const parts = [state.euipoMode === "application" ? "Anmeldung" : "Verlängerung"];
  if (state.euipoMode === "application") {
    parts.push(state.euipoElectronic ? "elektronisch" : "Papieranmeldung");
  }
  if (state.euipoOpposition) parts.push("Widerspruchsverfahren");
  return parts.join(" · ");
}

function describeWipoOptions() {
  const parts = [state.wipoMode === "application" ? "Anmeldung" : "Verlängerung"];
  if (state.wipoMode === "application") parts.push(state.wipoColor ? "Marke in Farbe" : "Schwarz-Weiß");
  const countryNames = state.wipoCountries
    .map((code) => WIPO_MEMBERS.find((m) => m.code === code)?.name)
    .filter(Boolean);
  if (countryNames.length > 0) parts.push(`benannte Länder: ${countryNames.join(", ")}`);
  return parts.join(" · ");
}

function printLineItemsTable(items, currency) {
  if (items.length === 0) return "";
  const rows = items
    .map((i) => `<tr><td>${escapeHtml(i.label)}</td><td class="amount">${formatAmount(i.amount, i.currency)}</td></tr>`)
    .join("");
  const total = sumItems(items, currency);
  return `<table class="line-items"><tbody>${rows}<tr class="subtotal"><td>Zwischensumme</td><td class="amount">${formatAmount(
    total,
    currency
  )}</td></tr></tbody></table>`;
}

function printSection(title, subtitle, tableHtml) {
  if (!tableHtml) return "";
  return `
    <section class="print-section">
      <h2>${escapeHtml(title)}</h2>
      ${subtitle ? `<p class="print-subtitle-small">${escapeHtml(subtitle)}</p>` : ""}
      ${tableHtml}
    </section>
  `;
}

function renderPrintView() {
  const container = document.getElementById("print-view");
  const now = new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  const title = state.reportTitle.trim();
  const sections = [];

  sections.push(`
    <header class="print-header">
      <h1>Gebührenübersicht Markenanmeldung</h1>
      ${title ? `<p class="print-subtitle">${escapeHtml(title)}</p>` : ""}
      <p class="print-meta">Erstellt am ${now} · Waren-/Dienstleistungsklassen: ${state.classes} · Wechselkurs CHF → EUR: ${state.exchangeRate}</p>
    </header>
  `);

  if (state.dpmaEnabled) {
    sections.push(printSection("DPMA (Deutschland)", describeDpmaOptions(), printLineItemsTable(lastDpmaItems, "EUR")));
  }
  if (state.euipoEnabled) {
    sections.push(printSection("EUIPO (Unionsmarke)", describeEuipoOptions(), printLineItemsTable(lastEuipoItems, "EUR")));
  }
  if (state.wipoEnabled) {
    const wipoTable = printLineItemsTable(lastWipoItems, "CHF");
    const wipoChf = sumItems(lastWipoItems, "CHF");
    const wipoNote = wipoTable ? `<p class="print-subtitle-small">≈ ${formatAmount(wipoChf * state.exchangeRate, "EUR")} bei Kurs ${state.exchangeRate}</p>` : "";
    sections.push(printSection("WIPO (Madrider System)", describeWipoOptions(), wipoTable + wipoNote));
  }
  if (state.ukipoEnabled) {
    const officialTable = printLineItemsTable(lastUkipoOfficialItems, "GBP");
    const attorneyGbpTable = state.clientView ? "" : printLineItemsTable(lastUkipoAttorneyItems, "GBP");
    const gbpForNote = sumItems(lastUkipoOfficialItems, "GBP") + (state.clientView ? 0 : sumItems(lastUkipoAttorneyItems, "GBP"));
    const ukipoNote = officialTable
      ? `<p class="print-subtitle-small">≈ ${formatAmount(gbpForNote * state.gbpExchangeRate, "EUR")} bei Kurs ${state.gbpExchangeRate}${
          state.clientView ? "" : " (Amt + Anwalt vor Ort)"
        }</p>`
      : "";
    sections.push(
      printSection(
        "UKIPO (Vereinigtes Königreich, Direktanmeldung)",
        "Amtliche Gebühr",
        officialTable + (attorneyGbpTable ? `<p class="print-subtitle-small">Honorar UK-Patentanwalt vor Ort</p>${attorneyGbpTable}` : "") + ukipoNote
      )
    );
  }
  if (state.chEnabled) {
    const officialChTable = printLineItemsTable(lastChOfficialItems, "CHF");
    const attorneyChTable = state.clientView ? "" : printLineItemsTable(lastChAttorneyItems, "CHF");
    const chfForNote = sumItems(lastChOfficialItems, "CHF") + (state.clientView ? 0 : sumItems(lastChAttorneyItems, "CHF"));
    const chNote = officialChTable
      ? `<p class="print-subtitle-small">≈ ${formatAmount(chfForNote * state.exchangeRate, "EUR")} bei Kurs ${state.exchangeRate}${
          state.clientView ? "" : " (Amt + Vertreterhonorar)"
        }</p>`
      : "";
    sections.push(
      printSection(
        "Schweiz (IGE, Direktanmeldung)",
        "Amtliche Gebühr",
        officialChTable + (attorneyChTable ? `<p class="print-subtitle-small">Vertreterhonorar vor Ort</p>${attorneyChTable}` : "") + chNote
      )
    );
  }

  const attorneyNet = sumItems(lastAttorneyItems, "EUR");
  const attorneyVat = state.attorneyVatEnabled ? attorneyNet * (state.attorneyVatRate / 100) : 0;
  const ukipoAttorneyEur = sumItems(lastUkipoAttorneyItems, "GBP") * state.gbpExchangeRate;
  const localAttorneyChfTotal = sumItems(lastLocalAttorneyItems, "CHF") + sumItems(lastChAttorneyItems, "CHF");
  const localAttorneyEur = localAttorneyChfTotal * state.exchangeRate + ukipoAttorneyEur;

  if (state.clientView) {
    const lumpSum = attorneyNet + attorneyVat + localAttorneyEur;
    if (lumpSum > 0) {
      sections.push(
        printSection(
          "Honorare",
          "Patentanwalt inkl. etwaiger Korrespondenzanwälte, Pauschalbetrag",
          `<table class="line-items"><tbody>
            <tr class="subtotal"><td>Honorare gesamt</td><td class="amount">${formatAmount(lumpSum, "EUR")}</td></tr>
          </tbody></table>`
        )
      );
    }
  } else {
    const attorneyTable = printLineItemsTable(lastAttorneyItems, "EUR");
    if (attorneyTable) {
      const vatTable = `<table class="line-items"><tbody>
        <tr><td>Nettosumme</td><td class="amount">${formatAmount(attorneyNet, "EUR")}</td></tr>
        <tr><td>zzgl. USt. (${state.attorneyVatEnabled ? state.attorneyVatRate : 0}%)</td><td class="amount">${formatAmount(attorneyVat, "EUR")}</td></tr>
        <tr class="subtotal"><td>Bruttosumme</td><td class="amount">${formatAmount(attorneyNet + attorneyVat, "EUR")}</td></tr>
      </tbody></table>`;
      sections.push(printSection("Patentanwaltliche Gebühren (netto)", "", attorneyTable + vatTable));
    }

    const localTable = printLineItemsTable(lastLocalAttorneyItems, "CHF");
    if (localTable) {
      sections.push(printSection("Honorar Patentanwalt vor Ort", "Korrespondenzanwalt, ohne deutsche USt.", localTable));
    }
  }

  const dpmaTotal = sumItems(lastDpmaItems, "EUR");
  const euipoTotal = sumItems(lastEuipoItems, "EUR");
  const wipoTotalChf = sumItems(lastWipoItems, "CHF");
  const wipoTotalEur = wipoTotalChf * state.exchangeRate;
  const ukipoOfficialEur = sumItems(lastUkipoOfficialItems, "GBP") * state.gbpExchangeRate;
  const chOfficialEur = sumItems(lastChOfficialItems, "CHF") * state.exchangeRate;
  const officialTotal = dpmaTotal + euipoTotal + wipoTotalEur + ukipoOfficialEur + chOfficialEur;
  const grandTotal = officialTotal + attorneyNet + attorneyVat + localAttorneyEur;

  const summaryRows = [
    `<tr><td>DPMA</td><td class="amount">${formatAmount(dpmaTotal, "EUR")}</td></tr>`,
    `<tr><td>EUIPO</td><td class="amount">${formatAmount(euipoTotal, "EUR")}</td></tr>`,
    `<tr><td>WIPO</td><td class="amount">${formatAmount(wipoTotalEur, "EUR")}</td></tr>`,
    `<tr><td>UKIPO</td><td class="amount">${formatAmount(ukipoOfficialEur, "EUR")}</td></tr>`,
    `<tr><td>Schweiz (IGE)</td><td class="amount">${formatAmount(chOfficialEur, "EUR")}</td></tr>`,
    `<tr class="subtotal"><td>Amtliche Gebühren gesamt (keine USt.)</td><td class="amount">${formatAmount(officialTotal, "EUR")}</td></tr>`,
  ];
  if (state.clientView) {
    summaryRows.push(
      `<tr><td>Honorare (Patentanwalt inkl. Korrespondenzanwälte)</td><td class="amount">${formatAmount(
        attorneyNet + attorneyVat + localAttorneyEur,
        "EUR"
      )}</td></tr>`
    );
  } else {
    summaryRows.push(
      `<tr><td>Patentanwaltliche Gebühren (netto)</td><td class="amount">${formatAmount(attorneyNet, "EUR")}</td></tr>`,
      `<tr><td>zzgl. USt. auf Anwaltsgebühren</td><td class="amount">${formatAmount(attorneyVat, "EUR")}</td></tr>`,
      `<tr><td>Honorar Patentanwalt vor Ort</td><td class="amount">${formatAmount(localAttorneyEur, "EUR")}</td></tr>`
    );
  }
  summaryRows.push(`<tr class="grand-total"><td>Gesamtsumme</td><td class="amount">${formatAmount(grandTotal, "EUR")}</td></tr>`);

  sections.push(`
    <section class="print-section">
      <h2>Gesamtübersicht</h2>
      <table class="line-items"><tbody>
        ${summaryRows.join("\n")}
      </tbody></table>
    </section>
  `);

  sections.push(`
    <footer class="print-footer">
      <p><strong>Hinweise</strong></p>
      <ul>
        <li>Amtliche Gebühren (DPMA, EUIPO, WIPO, UKIPO, Schweiz/IGE) sind Behördengebühren und nicht umsatzsteuerpflichtig.</li>
        <li>Patentanwaltliche Gebühren sind Nettobeträge zzgl. USt.</li>
        <li>Diese Übersicht dient der Orientierung und stellt keine verbindliche Auskunft oder Rechtsberatung dar.</li>
      </ul>
    </footer>
  `);

  container.innerHTML = sections.join("\n");
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

function bindToggle(id, key) {
  const el = document.getElementById(id);
  el.checked = state[key];
  el.addEventListener("change", () => {
    state[key] = el.checked;
    render();
  });
}

function bindNumber(id, key, onAfter) {
  const el = document.getElementById(id);
  el.value = state[key];
  el.addEventListener("input", () => {
    state[key] = Number(el.value) || 0;
    (onAfter || render)();
  });
}

function bindModeToggle(groupName, key) {
  const buttons = document.querySelectorAll(`[data-mode-group="${groupName}"]`);
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === state[key]);
    btn.addEventListener("click", () => {
      state[key] = btn.dataset.mode;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      updateModeVisibility();
      render();
    });
  });
}

function updateModeVisibility() {
  document.getElementById("dpma-application-only").style.display = state.dpmaMode === "application" ? "flex" : "none";
  document.getElementById("euipo-application-only").style.display = state.euipoMode === "application" ? "flex" : "none";
  document.getElementById("wipo-application-only").style.display = state.wipoMode === "application" ? "flex" : "none";
}

function setModeUI(groupName, mode) {
  document.querySelectorAll(`[data-mode-group="${groupName}"]`).forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

function syncFormFromState() {
  document.getElementById("report-title").value = state.reportTitle;
  document.getElementById("classes").value = state.classes;
  document.getElementById("exchange-rate").value = state.exchangeRate;
  document.getElementById("gbp-exchange-rate").value = state.gbpExchangeRate;

  document.getElementById("dpma-enabled").checked = state.dpmaEnabled;
  document.getElementById("dpma-panel").style.display = state.dpmaEnabled ? "flex" : "none";
  setModeUI("dpma", state.dpmaMode);
  document.getElementById("dpma-electronic").checked = state.dpmaElectronic;
  document.getElementById("dpma-accelerated").checked = state.dpmaAccelerated;
  document.getElementById("dpma-opposition").checked = state.dpmaOpposition;

  document.getElementById("euipo-enabled").checked = state.euipoEnabled;
  document.getElementById("euipo-panel").style.display = state.euipoEnabled ? "flex" : "none";
  setModeUI("euipo", state.euipoMode);
  document.getElementById("euipo-electronic").checked = state.euipoElectronic;
  document.getElementById("euipo-opposition").checked = state.euipoOpposition;

  document.getElementById("wipo-enabled").checked = state.wipoEnabled;
  document.getElementById("wipo-panel").style.display = state.wipoEnabled ? "flex" : "none";
  setModeUI("wipo", state.wipoMode);
  document.getElementById("wipo-color").checked = state.wipoColor;

  document.getElementById("ukipo-enabled").checked = state.ukipoEnabled;
  document.getElementById("ukipo-panel").style.display = state.ukipoEnabled ? "flex" : "none";

  document.getElementById("ch-enabled").checked = state.chEnabled;
  document.getElementById("ch-panel").style.display = state.chEnabled ? "flex" : "none";

  document.getElementById("attorney-vat-enabled").checked = state.attorneyVatEnabled;
  document.getElementById("attorney-vat-rate").value = state.attorneyVatRate;
  document.getElementById("client-view-enabled").checked = state.clientView;

  updateModeVisibility();
}

function resetForm() {
  const confirmed = window.confirm(
    "Formular für diesen Fall zurücksetzen? Alle aktuellen Eingaben (Klassen, Ämter, Länder, angehakte Honorarpositionen) gehen verloren. Die hinterlegten Honorarbeträge selbst bleiben erhalten."
  );
  if (!confirmed) return;

  const attorneyItems = state.attorneyItems;
  attorneyItems.forEach((item) => {
    item.enabled = false;
  });

  Object.assign(state, createDefaultCaseState(attorneyItems));

  syncFormFromState();
  renderAttorneyInputs();
  render();
  renderCaseTabs();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchCase(id) {
  if (id === activeCaseId) return;
  const target = cases.find((c) => c.id === id);
  if (!target) return;

  activeCaseId = id;
  state = target.state;

  syncFormFromState();
  renderAttorneyInputs();
  render();
  renderCaseTabs();
  persistCases();
}

function addCase() {
  const seedAttorneyItems = state.attorneyItems.map((item) => ({ ...item, enabled: false }));
  const newCase = { id: generateCaseId(), state: createDefaultCaseState(seedAttorneyItems) };
  cases.push(newCase);
  switchCase(newCase.id);
}

function deleteCase(id) {
  if (cases.length <= 1) return;
  const target = cases.find((c) => c.id === id);
  if (!target) return;

  const confirmed = window.confirm(`Fall "${caseLabel(target)}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`);
  if (!confirmed) return;

  const index = cases.indexOf(target);
  cases.splice(index, 1);

  if (activeCaseId === id) {
    const nextCase = cases[Math.max(0, index - 1)];
    activeCaseId = nextCase.id;
    state = nextCase.state;
    syncFormFromState();
    renderAttorneyInputs();
    render();
  }

  renderCaseTabs();
  persistCases();
}

function renderCaseTabs() {
  const container = document.getElementById("case-tabs");
  container.innerHTML = "";

  cases.forEach((c) => {
    const tab = document.createElement("div");
    tab.className = "case-tab" + (c.id === activeCaseId ? " active" : "");

    const labelBtn = document.createElement("button");
    labelBtn.type = "button";
    labelBtn.className = "case-tab-label";
    labelBtn.textContent = caseLabel(c);
    labelBtn.addEventListener("click", () => switchCase(c.id));
    tab.appendChild(labelBtn);

    if (cases.length > 1) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "case-tab-close";
      closeBtn.title = "Fall löschen";
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCase(c.id);
      });
      tab.appendChild(closeBtn);
    }

    container.appendChild(tab);
  });
}

function bindSectionToggle(checkboxId, panelId, key) {
  const el = document.getElementById(checkboxId);
  const panel = document.getElementById(panelId);
  el.checked = state[key];
  panel.style.display = state[key] ? "flex" : "none";
  el.addEventListener("change", () => {
    state[key] = el.checked;
    panel.style.display = el.checked ? "flex" : "none";
    render();
  });
}

const STALE_AFTER_MONTHS = 6;

function monthsSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

function isStale(dateStr) {
  return monthsSince(dateStr) >= STALE_AFTER_MONTHS;
}

function checkDataStaleness() {
  const offices = [
    { name: "DPMA", asOf: DPMA_FEES.asOf, elId: "dpma-asof" },
    { name: "EUIPO", asOf: EUIPO_FEES.asOf, elId: "euipo-asof" },
    { name: "WIPO", asOf: WIPO_BASE_FEES.asOf, elId: "wipo-asof" },
    { name: "UKIPO", asOf: UKIPO_FEES.asOf, elId: "ukipo-asof" },
    { name: "Schweiz (IGE)", asOf: CH_FEES.asOf, elId: "ch-asof" },
  ];

  const staleNames = [];
  for (const office of offices) {
    if (!isStale(office.asOf)) continue;
    staleNames.push(office.name);
    const el = document.getElementById(office.elId);
    const badge = document.createElement("span");
    badge.className = "badge-warn";
    badge.textContent = "⚠ Stand prüfen";
    badge.title = `Stand ${office.asOf} – älter als ${STALE_AFTER_MONTHS} Monate. Bitte gegen die offizielle Quelle prüfen.`;
    el.appendChild(document.createTextNode(" "));
    el.appendChild(badge);
  }

  const banner = document.getElementById("stale-banner");
  if (staleNames.length > 0) {
    banner.textContent = `⚠ Die hinterlegten Gebührendaten für ${staleNames.join(
      ", "
    )} sind älter als ${STALE_AFTER_MONTHS} Monate und wurden seither möglicherweise nicht mehr aktualisiert. Bitte vor verbindlicher Nutzung gegen die offiziellen Quellen (siehe „Hinweise zu den Daten“ unten) prüfen.`;
    banner.style.display = "block";
  } else {
    banner.style.display = "none";
  }
}

function init() {
  document.getElementById("dpma-asof").textContent = `Stand ${DPMA_FEES.asOf} · dpma.de`;
  document.getElementById("euipo-asof").textContent = `Stand ${EUIPO_FEES.asOf} · euipo.europa.eu`;
  document.getElementById("wipo-asof").textContent = `Stand ${WIPO_BASE_FEES.asOf} · wipo.int`;
  document.getElementById("source-dpma").textContent = `DPMA: Amtliche Gebühren, Stand ${DPMA_FEES.asOf} (${DPMA_FEES.sourceUrl}).`;
  document.getElementById("source-euipo").textContent = `EUIPO: Amtliche Gebühren, Stand ${EUIPO_FEES.asOf} (${EUIPO_FEES.sourceUrl}).`;
  document.getElementById("source-wipo").textContent = `WIPO: Grundgebühren amtlich, Stand ${WIPO_BASE_FEES.asOf} (${WIPO_BASE_FEES.sourceUrl}). Mit ⚠ markierte Benennungsgebühren sind ungeprüfte Schätzwerte.`;
  document.getElementById("ukipo-asof").textContent = `Stand ${UKIPO_FEES.asOf}`;
  document.getElementById("source-ukipo").textContent = `UKIPO: Amtliche Gebühr und Service Charge des UK-Korrespondenzanwalts, Stand ${UKIPO_FEES.asOf} (${UKIPO_FEES.note})`;
  document.getElementById("ch-asof").textContent = `Stand ${CH_FEES.asOf}`;
  document.getElementById("source-ch").textContent = `Schweiz (IGE): Amtliche Gebühr und Vertreterhonorar vor Ort, Stand ${CH_FEES.asOf} (${CH_FEES.note})`;
  checkDataStaleness();

  bindNumber("classes", "classes");
  bindNumber("exchange-rate", "exchangeRate");
  bindNumber("gbp-exchange-rate", "gbpExchangeRate");

  bindSectionToggle("dpma-enabled", "dpma-panel", "dpmaEnabled");
  bindSectionToggle("euipo-enabled", "euipo-panel", "euipoEnabled");
  bindSectionToggle("wipo-enabled", "wipo-panel", "wipoEnabled");
  bindSectionToggle("ukipo-enabled", "ukipo-panel", "ukipoEnabled");
  bindSectionToggle("ch-enabled", "ch-panel", "chEnabled");

  bindModeToggle("dpma", "dpmaMode");
  bindModeToggle("euipo", "euipoMode");
  bindModeToggle("wipo", "wipoMode");
  updateModeVisibility();

  bindToggle("dpma-electronic", "dpmaElectronic");
  bindToggle("dpma-accelerated", "dpmaAccelerated");
  bindToggle("dpma-opposition", "dpmaOpposition");

  bindToggle("euipo-electronic", "euipoElectronic");
  bindToggle("euipo-opposition", "euipoOpposition");

  bindToggle("wipo-color", "wipoColor");

  bindToggle("attorney-vat-enabled", "attorneyVatEnabled");
  bindNumber("attorney-vat-rate", "attorneyVatRate");
  bindToggle("client-view-enabled", "clientView");

  document.getElementById("jump-to-wipo-countries").addEventListener("click", () => {
    const wipoCheckbox = document.getElementById("wipo-enabled");
    if (!wipoCheckbox.checked) {
      wipoCheckbox.checked = true;
      wipoCheckbox.dispatchEvent(new Event("change"));
    }
    document.getElementById("wipo-countries").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("report-title").addEventListener("input", (e) => {
    state.reportTitle = e.target.value;
    renderCaseTabs();
  });

  document.getElementById("print-button").addEventListener("click", () => {
    renderPrintView();
    window.print();
  });

  document.getElementById("reset-button").addEventListener("click", resetForm);
  document.getElementById("add-case-button").addEventListener("click", addCase);

  renderAttorneyInputs();
  renderCaseTabs();

  render();
}

document.addEventListener("DOMContentLoaded", init);
