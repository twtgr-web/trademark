# Markenanmeldung – Gebührenrechner

Rechner für die amtlichen Gebühren von DPMA, EUIPO, WIPO (Madrider System), UKIPO und der
Schweiz (IGE) sowie patentanwaltliche Gebühren bei Markenanmeldungen. Reines HTML/CSS/JavaScript,
kein Build-Schritt, kein Server nötig.

## Funktionen

- **DPMA**: Anmeldung/Verlängerung, elektronische/Papier-Anmeldung, beschleunigte Prüfung,
  Widerspruchsgebühr, Klassengebühren.
- **EUIPO**: Anmeldung/Verlängerung, Klassengebühren (1./2./ab 3. Klasse), Widerspruchsgebühr.
- **WIPO (Madrider System)**: Grundgebühr (Schwarz-Weiß/Farbe), Zusatzgebühr je Klasse,
  Benennungsgebühren für eine Auswahl von Mitgliedsstaaten (editierbar, einige Beträge sind
  ungeprüfte Schätzwerte und entsprechend gekennzeichnet).
- **UKIPO (Vereinigtes Königreich)**: Direktanmeldung (nicht über WIPO/Madrid) mit amtlicher
  Gebühr und Service Charge des UK-Korrespondenzanwalts in GBP, Umrechnung in Euro.
- **Schweiz (IGE)**: Direktanmeldung (nicht über WIPO/Madrid) mit amtlicher Gebühr (inkl. 3
  Klassen, Klassengebühr ab der 4.) und pauschalem Vertreterhonorar vor Ort in CHF.
- **Patentanwaltliche Gebühren**: Voreingestellte Honorarsätze (Beratung, Recherche,
  Grund-/Klassengebühren je Amt, Priorität, Veröffentlichung, Urkunde, Benennungshonorar je
  WIPO-Land, Honorar des Korrespondenzanwalts vor Ort), per Checkbox je Position ein-/ausblendbar
  (Standard: aus), editierbar direkt in der App und per `localStorage` im Browser gespeichert.
  Inkl. USt.-Aufschlag (Standard 19 %, editierbar) auf die Netto-Honorare; amtliche Gebühren
  sind USt.-frei.
- Gesamtübersicht mit Umrechnung der WIPO-/UKIPO-/Schweiz-Gebühren und des Vor-Ort-/
  Vertreterhonorars (CHF/GBP) in Euro.
- **Drucken / PDF**: Button "Übersicht drucken / als PDF speichern" erzeugt eine saubere,
  auf die aktuelle Eingabe reduzierte Druckansicht (nur aktivierte Ämter/Positionen, keine
  Formularelemente) über die native Browser-Druckfunktion – im Druckdialog als Ziel
  "Als PDF speichern" wählen. Optional lässt sich vorher eine Bezeichnung/Referenz (z. B.
  Markenname) eintragen, die im Dokument erscheint.
- **Mandantenansicht**: Checkbox, die im PDF die einzelnen Honorarpositionen zu einer
  Pauschalsumme zusammenfasst, ohne die interne Kostenstruktur offenzulegen. Amtliche
  Gebühren bleiben weiterhin aufgeschlüsselt.
- **Kostenvergleich**: Vergleicht (nur amtliche Gebühren) die Direktanmeldung bei EUIPO/UKIPO/
  Schweiz mit einer IR-Marke über WIPO für dieselbe Länderabdeckung, jeweils inkl. DPMA oder
  EUIPO als notwendiger Basismarke.
- **Rechtlicher Hinweis zur Basismarke**: Warnt, wenn WIPO/Madrid aktiviert ist, aber weder
  DPMA noch EUIPO als Basismarke ausgewählt sind.
- **Veraltete-Daten-Warnung**: Zeigt ein Banner sowie Badges an den jeweiligen Ämtern, sobald
  deren "Stand"-Datum älter als 6 Monate ist.
- **Reset**: Setzt alle Eingaben des aktuellen Falls auf die Grundwerte zurück (mit
  Sicherheitsabfrage), lässt aber die hinterlegten Honorarbeträge unangetastet.
- **Mehrere Fälle**: Tableiste oben, um mehrere Markenanmeldungen parallel zu bearbeiten und
  zwischen ihnen zu wechseln, ohne Eingaben zu verlieren. Jeder Fall speichert seinen eigenen
  Stand automatisch im Browser (`localStorage`); die Fall-Tabs übernehmen automatisch die
  eingetragene Bezeichnung/Referenz als Titel.

Die Gebührendaten liegen gesammelt in `fees-data.js` und lassen sich dort bei
Gebührenänderungen zentral aktualisieren, ohne die Rechenlogik (`app.js`) anfassen zu müssen.

⚠️ Alle Angaben dienen der Orientierung und stellen keine verbindliche Auskunft oder
Rechtsberatung dar. Insbesondere die WIPO-Benennungsgebühren für nicht eigens verifizierte
Länder sollten vor verbindlicher Nutzung gegen den
[WIPO Fee Calculator](https://madrid.wipo.int/feecalcapp/) geprüft werden.

## Lokal testen

Einfach `index.html` im Browser öffnen, oder z. B. mit einem simplen lokalen Server:

```bash
python3 -m http.server 8000
```

Anschließend [http://localhost:8000](http://localhost:8000) öffnen.

## Hosting über GitHub Pages

Da es sich um statisches HTML/CSS/JS ohne Build-Schritt handelt, reicht die einfache
Variante:

1. Im Repo unter **Settings → Pages** bei "Build and deployment" → "Source" **"Deploy from a
   branch"** auswählen.
2. Branch auswählen (z. B. `main`) und als Ordner **`/ (root)`**.
3. Speichern – nach ein bis zwei Minuten ist die Seite unter
   `https://<dein-github-name>.github.io/<repo-name>/` erreichbar.

Kein Build, kein Workflow, keine Installation nötig – genauso wie bei einem einfachen
statischen Projekt mit eigener `index.html`.
