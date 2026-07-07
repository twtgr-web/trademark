"use strict";

// Direktlinks zu den offiziellen, kostenlosen Recherche-Landingpages der einzelnen Ämter.
// Diese Systeme unterstützen (anders als TMview) keine zuverlässig dokumentierte
// Vorbefüllung des Suchbegriffs per URL, daher nur ein Link zur Startseite.
const DIRECT_LINKS = [
  { label: "DPMAregister (Deutschland)", url: "https://register.dpma.de/DPMAregister/Uebersicht" },
  { label: "EUIPO eSearch plus (Unionsmarke)", url: "https://euipo.europa.eu/eSearch/" },
  { label: "WIPO Global Brand Database (IR-Marken)", url: "https://branddb.wipo.int/en/quicksearch" },
  { label: "UK IPO Trade Mark Search (Vereinigtes Königreich)", url: "https://trademarks.ipo.gov.uk/ipo-tmtext" },
  { label: "Swissreg (Schweiz)", url: "https://www.swissreg.ch/" },
];

function buildTmviewUrl(term, classes, officeCodes) {
  const params = ["page=1", "pageSize=30", "criteria=C"];
  if (officeCodes.length > 0) {
    params.push(`offices=${officeCodes.join(",")}`);
  }
  if (term) {
    params.push(`basicSearch=${encodeURIComponent(term)}`);
  }
  if (classes.length > 0) {
    params.push(`niceClass=${classes.join(",")}`);
  }
  return `https://www.tmdn.org/tmview/#/tmview/results?${params.join("&")}`;
}

function parseClasses(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}$/.test(s));
}

function renderDirectLinks() {
  const container = document.getElementById("direct-links");
  container.innerHTML = "";
  for (const link of DIRECT_LINKS) {
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "direct-link";
    a.textContent = link.label;
    container.appendChild(a);
  }
}

// Aktualisiert das href-Attribut des TMview-Links bei jeder Eingabe, statt die Seite per
// window.open() zu öffnen. Manche Sicherheitssysteme (auch bei EUIPO selbst) stufen per
// Skript geöffnete Popups ohne Referrer als verdächtig ein; ein normaler Linkklick mit
// erhaltenem Referrer (rel="noopener" statt "noreferrer") vermeidet das.
function updateTmviewLink() {
  const term = document.getElementById("search-term").value.trim();
  const classes = parseClasses(document.getElementById("search-classes").value);
  const officeMap = [
    ["office-de", "DE"],
    ["office-em", "EM"],
    ["office-wo", "WO"],
    ["office-gb", "GB"],
    ["office-ch", "CH"],
  ];
  const officeCodes = officeMap.filter(([id]) => document.getElementById(id).checked).map(([, code]) => code);

  const link = document.getElementById("tmview-button");
  link.href = term ? buildTmviewUrl(term, classes, officeCodes) : "https://www.tmdn.org/tmview/";
}

function init() {
  renderDirectLinks();

  const inputIds = ["search-term", "search-classes", "office-de", "office-em", "office-wo", "office-gb", "office-ch"];
  for (const id of inputIds) {
    document.getElementById(id).addEventListener("input", updateTmviewLink);
  }

  document.getElementById("tmview-button").addEventListener("click", (e) => {
    if (!document.getElementById("search-term").value.trim()) {
      e.preventDefault();
      window.alert("Bitte zuerst einen Suchbegriff eingeben.");
    }
  });

  updateTmviewLink();
}

document.addEventListener("DOMContentLoaded", init);
