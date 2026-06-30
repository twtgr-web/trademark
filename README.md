# Markenanmeldung – Gebührenrechner

Rechner für die amtlichen Gebühren von DPMA, EUIPO und WIPO (Madrider System) sowie
patentanwaltliche Gebühren bei Markenanmeldungen.

## Funktionen

- **DPMA**: Anmeldung/Verlängerung, elektronische/Papier-Anmeldung, beschleunigte Prüfung,
  Widerspruchsgebühr, Klassengebühren.
- **EUIPO**: Anmeldung/Verlängerung, Klassengebühren (1./2./ab 3. Klasse), Widerspruchsgebühr.
- **WIPO (Madrider System)**: Grundgebühr (Schwarz-Weiß/Farbe), Zusatzgebühr je Klasse,
  Benennungsgebühren für eine Auswahl von Mitgliedsstaaten (editierbar, einige Beträge sind
  ungeprüfte Schätzwerte und entsprechend gekennzeichnet).
- **Patentanwaltliche Gebühren**: Konfigurierbare Platzhalter-Positionen (Beratung, Recherche,
  Bearbeitungsgebühren je Amt, Auslandskorrespondenz etc.), editierbar direkt in der App und
  per `localStorage` gespeichert.
- Gesamtübersicht mit Umrechnung der WIPO-Gebühren (CHF) in Euro.

Die Gebührendaten liegen in `src/lib/fees/` (`dpma.ts`, `euipo.ts`, `wipo.ts`, `attorney.ts`)
und lassen sich dort bei Gebührenänderungen zentral aktualisieren.

⚠️ Alle Angaben dienen der Orientierung und stellen keine verbindliche Auskunft oder
Rechtsberatung dar. Insbesondere die WIPO-Benennungsgebühren für nicht eigens verifizierte
Länder sollten vor verbindlicher Nutzung gegen den
[WIPO Fee Calculator](https://madrid.wipo.int/feecalcapp/) geprüft werden.

## Entwicklung

```bash
npm install
npm run dev
```

Anschließend [http://localhost:3000](http://localhost:3000) öffnen.

```bash
npm run lint    # ESLint
npm run build   # Produktions-/statischer Build (output: "export")
```

## Deployment

Die App ist als statischer Export konfiguriert (`next.config.ts: output: "export"`), da sie
keine Server-Komponenten benötigt. Nach `npm run build` liegt das fertige Static-Site-Bundle
im Ordner `out/` und kann z. B. direkt auf **GitHub Pages** veröffentlicht werden. Alternativ
lässt sich das Repository ohne weitere Anpassungen mit **Vercel** oder **Netlify** verbinden.
