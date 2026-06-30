# Markenanmeldung – Gebührenrechner

Rechner für die amtlichen Gebühren von DPMA, EUIPO und WIPO (Madrider System) sowie
patentanwaltliche Gebühren bei Markenanmeldungen. Reines HTML/CSS/JavaScript, kein
Build-Schritt, kein Server nötig.

## Funktionen

- **DPMA**: Anmeldung/Verlängerung, elektronische/Papier-Anmeldung, beschleunigte Prüfung,
  Widerspruchsgebühr, Klassengebühren.
- **EUIPO**: Anmeldung/Verlängerung, Klassengebühren (1./2./ab 3. Klasse), Widerspruchsgebühr.
- **WIPO (Madrider System)**: Grundgebühr (Schwarz-Weiß/Farbe), Zusatzgebühr je Klasse,
  Benennungsgebühren für eine Auswahl von Mitgliedsstaaten (editierbar, einige Beträge sind
  ungeprüfte Schätzwerte und entsprechend gekennzeichnet).
- **Patentanwaltliche Gebühren**: Honorarsätze gemäß interner Gebührenliste (Beratung,
  Recherche, Grund-/Klassengebühren je Amt, Priorität, Veröffentlichung, Urkunde,
  Benennungshonorar je WIPO-Land, Honorar des Korrespondenzanwalts vor Ort), editierbar
  direkt in der App und per `localStorage` im Browser gespeichert. Inkl. USt.-Aufschlag
  (Standard 19 %, editierbar) auf die Netto-Honorare; amtliche Gebühren sind USt.-frei.
- Gesamtübersicht mit Umrechnung der WIPO-Gebühren und des Vor-Ort-Honorars (CHF) in Euro.

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
