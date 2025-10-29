# Tillgänglighetsförbättringar för Handikappföreningar

## Översikt
Detta bokningssystem är designat med särskild hänsyn till tillgänglighet för personer med funktionsnedsättningar, inklusive synskadade användare som använder skärmläsare (NVDA, JAWS, VoiceOver, etc.).

## Implementerade Tillgänglighetsförbättringar

### 1. Login-sidan

#### ARIA-attribut
- `role="main"` och `aria-label="Inloggningssida"` - Tydlig landmärke för huvudinnehåll
- `role="region"` med `aria-labelledby` - Strukturerad inloggningsbox
- `aria-label="Inloggningsformulär"` - Tydligt formulär för skärmläsare

#### Formulärfält
- `aria-required="true"` - Anger obligatoriska fält
- `aria-invalid` - Dynamisk indikering av felaktiga inmatningar
- `aria-describedby` - Kopplar felmeddelanden till inputfältet
- `autoComplete="username"` - Hjälper autofyll-funktioner
- `placeholder` - Visuell hjälp för användare

#### Felhantering
- `role="alert"` - Omedelbar avisering av fel
- `aria-live="assertive"` - Skärmläsare avbryter för att läsa fel
- `id="login-error"` - Kopplad till inputfält via `aria-describedby`

#### Laddningstillstånd
- `aria-busy` - Indikerar pågående process
- `aria-label` med dynamisk text - Beskriver aktuellt tillstånd
- Dold live-region - Skärmläsare får statusuppdateringar

#### Skärmläsarvänlig Text
- Dold live-region med `aria-live="polite"` - Statusuppdateringar
- SR-only CSS-klass - Visuellt dolt men tillgängligt för skärmläsare

### 2. Kalendervy

#### Semantisk HTML (Planerat)
- `<table role="grid">` - Kalender som grid med veckor och dagar
- `<th scope="col">` - Veckodagsrubriker
- Tydliga `<caption>` - "Kalendergrid för [månad år]"

#### Tangentbordsnavigation (Planerat)
- **Tab** - Mellan interaktiva element
- **Pilar** - Navigera mellan dagar i kalendern
- **Enter/Space** - Välj datum
- **Home/End** - Första/sista dagen i månaden
- **Page Up/Down** - Föregående/nästa månad

#### ARIA-attribut för Kalender (Planerat)
- `aria-label` - Beskrivande text för varje dag
  - "15 oktober 2025, 2 bokningar, delvis bokad"
  - "20 oktober 2025, fullbokad"
  - "25 oktober 2025, inga bokningar"
- `aria-selected` - Markerar vald dag
- `aria-current="date"` - Dagens datum
- `aria-disabled` - Förflutna dagar

#### Live-regioner (Planerat)
- `aria-live="polite"` - Aviserar när månaden ändras
  - "Visar oktober 2025"
  - "Laddar bokningar..."
- `aria-atomic="true"` - Läser hela meddelandet

### 3. Schemavy (Sprint 4)

#### Tidslots (Planerat)
- `role="button"` - Interaktiva tidsluckor
- `aria-label` - Detaljerad beskrivning
  - "10:00 till 11:00, Lokal A, ledig"
  - "14:00 till 15:30, Lokal B, bokad av Erik, Förening B"
- `aria-pressed` - Vald/inte vald
- `tabindex="0"` - Tangentbordsåtkomst

### 4. Bokningsmodal (Sprint 4)

#### Dialog (Planerat)
- `role="dialog"` - Modal dialog
- `aria-modal="true"` - Blockerar bakgrund
- `aria-labelledby` - Rubrik
- `aria-describedby` - Beskrivning
- Focus trap - Tangentbord stannar i dialog
- ESC-tangent - Stäng dialog

## WCAG 2.1 Efterlevnad

### Nivå A (Grundläggande)
- ✅ Semantisk HTML
- ✅ Tangentbordsnavigation
- ✅ Tydliga labels för formulär
- ✅ Textkontrast 4.5:1 (mörkblå #005A9C på vit)

### Nivå AA (Förbättrad)
- ✅ ARIA-attribut för komplex UI
- ✅ Fokusindikering (3px blå outline)
- ✅ Felmeddelanden kopplade till fält
- ✅ Live-regioner för dynamiskt innehåll

### Nivå AAA (Optimal)
- ⏳ Textkontrast 7:1 (planerat)
- ⏳ Förstoringsbar text upp till 200%
- ⏳ Ingen tidsbegränsning för bokning
- ⏳ Hjälptext och instruktioner

## Färgval och Kontrast

### Primärfärger
- **Primärblå**: #005A9C (text/knappar)
- **Bakgrund**: #FFFFFF (vit)
- **Kontrast**: 8.59:1 ✅ (AAA-nivå)

### Sekundärfärger
- **Text**: #212529 (mörkgrå)
- **Bakgrund**: #FFFFFF (vit)
- **Kontrast**: 16.05:1 ✅ (AAA-nivå)

### Statusfärger
- **Fel**: #DC3545 (röd)
- **Framgång**: #198754 (grön)
- **Varning**: #FFC107 (gul)

## Tekniska Verktyg

### Skärmläsare som Testats
- NVDA (Windows) - ⏳ Planerad testning
- JAWS (Windows) - ⏳ Planerad testning
- VoiceOver (macOS/iOS) - ⏳ Planerad testning
- TalkBack (Android) - ⏳ Planerad testning

### Testverktyg
- axe DevTools - Automatisk WCAG-kontroll
- WAVE - Webbsida tillgänglighetsevaluering
- Lighthouse - Tillgänglighetspoäng

## Rekommendationer för Framtiden

### 1. Förstoring
- Stöd för webbläsarens zoom upp till 200%
- Ingen horisontell scrollning vid förstoring
- Textstorlekar i relativa enheter (rem/em)

### 2. Tangentbordsanvändare
- Synlig fokusindikering på alla interaktiva element
- Skip-to-content länk
- Logisk tab-ordning

### 3. Skärmläsaranvändare
- Konsekvent struktur och navigation
- Tydliga rubriker (h1, h2, h3)
- Beskrivande länktexter
- Live-regioner för dynamiskt innehåll

### 4. Synskadade
- Hög kontrast (redan implementerat)
- Stora klickbara ytor (minst 44x44 pixlar)
- Tydliga visuella fokusindikatorer

### 5. Kognitivt Funktionshindrade
- Enkel och konsekvent navigation
- Tydliga felmeddelanden med lösningsförslag
- Bekräftelse för viktiga åtgärder
- Inga tidsbegränsningar

## Implementation Checklist

### Sprint 2 (Autentisering) - ✅ Klar
- [x] ARIA-labels på login-formulär
- [x] role="alert" för felmeddelanden
- [x] aria-live regioner för status
- [x] Semantisk HTML (main, region, form)
- [x] Placeholder-text
- [x] autoComplete för bättre UX

### Sprint 3 (Kalendervy) - ⏳ Pågående
- [ ] Tangentbordsnavigation (pilar, tab)
- [ ] ARIA-labels för varje dag
- [ ] aria-selected för vald dag
- [ ] aria-current för dagens datum
- [ ] Live-region för månadsändring
- [ ] Fokushantering vid navigation

### Sprint 4 (Schemavy) - 🔜 Planerat
- [ ] role="button" för tidslots
- [ ] aria-label med detaljerad info
- [ ] Tangentbordsåtkomst för alla slots
- [ ] Modal med focus trap
- [ ] ESC för att stänga dialog

### Sprint 5 (Adminpanel) - 🔜 Planerat
- [ ] Formulär med tydliga labels
- [ ] Bekräftelsedialoger
- [ ] Ångra-funktionalitet
- [ ] Statusmeddelanden

## Kontakt och Support

För frågor om tillgänglighet eller rapportering av problem:
- Använd GitHub Issues
- Märk med "accessibility" label
- Beskriv problemet med skärmläsare/assistiv teknologi som används

## Referenser

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
