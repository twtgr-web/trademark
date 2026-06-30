"use strict";

const STORAGE_KEY = "trademark-fee-calculator:attorney-fees";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const chf = new Intl.NumberFormat("de-DE", { style: "currency", currency: "CHF" });

function formatAmount(amount, currency) {
  return currency === "CHF" ? chf.format(amount) : eur.format(amount);
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

function calculateAttorneyFees(items, classes, designatedCountryCount) {
  return items
    .filter((item) => item.amount > 0)
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

function loadAttorneyItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return ATTORNEY_FEE_ITEMS.map((i) => ({ ...i }));
    const saved = JSON.parse(raw);
    return ATTORNEY_FEE_ITEMS.map((item) => {
      const match = saved.find((s) => s.id === item.id);
      return match ? { ...item, amount: Number(match.amount) || 0 } : { ...item };
    });
  } catch {
    return ATTORNEY_FEE_ITEMS.map((i) => ({ ...i }));
  }
}

function saveAttorneyItems(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const state = {
  classes: 3,
  exchangeRate: 1.06,

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

  attorneyItems: loadAttorneyItems(),
  attorneyVatEnabled: true,
  attorneyVatRate: ATTORNEY_VAT_RATE_DEFAULT,
};

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

function createOverrideField(labelText, placeholder, value, onInput) {
  const wrap = document.createElement("label");
  wrap.className = "override-field";
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
        createOverrideField("Vor Ort", "CHF", state.wipoLocalAttorneyOverrides[member.code], (v) => {
          if (v === undefined) delete state.wipoLocalAttorneyOverrides[member.code];
          else state.wipoLocalAttorneyOverrides[member.code] = v;
          renderAttorneyResults();
          renderSummary();
        })
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
    field.className = "field";
    const span = document.createElement("span");
    span.textContent = item.label + (scopeSuffix[item.scope] || "");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = item.amount;
    input.addEventListener("input", () => {
      item.amount = Number(input.value) || 0;
      saveAttorneyItems(state.attorneyItems);
      renderAttorneyResults();
      renderSummary();
    });
    field.appendChild(span);
    field.appendChild(input);
    groupGrid.appendChild(field);
  }
}

let lastDpmaItems = [];
let lastEuipoItems = [];
let lastWipoItems = [];
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
  const attorneyNet = sumItems(lastAttorneyItems, "EUR");
  const attorneyVat = state.attorneyVatEnabled ? attorneyNet * (state.attorneyVatRate / 100) : 0;
  const localAttorneyChf = sumItems(lastLocalAttorneyItems, "CHF");
  const localAttorneyEur = localAttorneyChf * state.exchangeRate;
  const officialTotal = dpmaTotal + euipoTotal + wipoTotalEur;
  const grandTotal = officialTotal + attorneyNet + attorneyVat + localAttorneyEur;

  document.getElementById("summary-dpma").textContent = formatAmount(dpmaTotal, "EUR");
  document.getElementById("summary-euipo").textContent = formatAmount(euipoTotal, "EUR");
  document.getElementById("summary-wipo").textContent = formatAmount(wipoTotalEur, "EUR");
  document.getElementById("summary-wipo-chf").textContent = `(${formatAmount(wipoTotalChf, "CHF")})`;
  document.getElementById("summary-official").textContent = formatAmount(officialTotal, "EUR");
  document.getElementById("summary-attorney-net").textContent = formatAmount(attorneyNet, "EUR");
  document.getElementById("summary-attorney-vat").textContent = formatAmount(attorneyVat, "EUR");
  document.getElementById("summary-vat-rate-label").textContent = `(${state.attorneyVatEnabled ? state.attorneyVatRate : 0}%)`;
  document.getElementById("summary-local-attorney").textContent = formatAmount(localAttorneyEur, "EUR");
  document.getElementById("summary-local-attorney-chf").textContent = `(${formatAmount(localAttorneyChf, "CHF")})`;
  document.getElementById("summary-total").textContent = formatAmount(grandTotal, "EUR");
}

function render() {
  renderDpmaResults();
  renderEuipoResults();
  renderWipoCountryList();
  renderWipoResults();
  renderAttorneyResults();
  renderSummary();
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

function init() {
  document.getElementById("dpma-asof").textContent = `Stand ${DPMA_FEES.asOf} · dpma.de`;
  document.getElementById("euipo-asof").textContent = `Stand ${EUIPO_FEES.asOf} · euipo.europa.eu`;
  document.getElementById("wipo-asof").textContent = `Stand ${WIPO_BASE_FEES.asOf} · wipo.int`;
  document.getElementById("source-dpma").textContent = `DPMA: Amtliche Gebühren, Stand ${DPMA_FEES.asOf} (${DPMA_FEES.sourceUrl}).`;
  document.getElementById("source-euipo").textContent = `EUIPO: Amtliche Gebühren, Stand ${EUIPO_FEES.asOf} (${EUIPO_FEES.sourceUrl}).`;
  document.getElementById("source-wipo").textContent = `WIPO: Grundgebühren amtlich, Stand ${WIPO_BASE_FEES.asOf} (${WIPO_BASE_FEES.sourceUrl}). Mit ⚠ markierte Benennungsgebühren sind ungeprüfte Schätzwerte.`;

  bindNumber("classes", "classes");
  bindNumber("exchange-rate", "exchangeRate");

  bindSectionToggle("dpma-enabled", "dpma-panel", "dpmaEnabled");
  bindSectionToggle("euipo-enabled", "euipo-panel", "euipoEnabled");
  bindSectionToggle("wipo-enabled", "wipo-panel", "wipoEnabled");

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

  renderAttorneyInputs();

  render();
}

document.addEventListener("DOMContentLoaded", init);
