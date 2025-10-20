## 1. För användare med synnedsättning (blinda, svagsynta, färgblinda)

Detta handlar om att information inte bara får finnas visuellt.

    Skärmläsarkompatibilitet (för blinda användare):

        Vad: En skärmläsare är en programvara som läser upp innehållet på skärmen. Den kan inte tolka bilder eller design, bara kod.

        Hur för dig:

            Använd rätt HTML-element: Använd <button> för knappar (inte en <div> som ser ut som en knapp), <label> för formulärfält, och <h1>, <h2> för rubriker. Då kan skärmläsaren säga "Logga in, knapp" istället för bara "Logga in".

            ARIA-attribut: För komplexa komponenter som en kalender är ARIA (Accessible Rich Internet Applications) avgörande. Varje datum i kalendern bör vara en knapp (<button>) med en tydlig etikett, t.ex. aria-label="Välj datum 20 oktober 2025. Lediga tider finns.".

            Allt ska ha text: Alla ikoner (som pilarna för att byta månad) måste ha en textbeskrivning, antingen synlig eller för skärmläsare (aria-label="Nästa månad").

    Tillräcklig kontrast (för svagsynta):

        Vad: Text och viktiga element måste ha tillräckligt hög kontrast mot bakgrunden för att vara läsbara.

        Hur för dig: Använd ett online-kontrastverktyg för att säkerställa att din textfärg (t.ex. grå text) mot din bakgrund (vit) uppfyller WCAG AA-standarden (minst 4.5:1 i kontrastförhållande). Din blå färg ser bra ut, men dubbelkolla den gärna.

    Inte förlita sig på färg (för färgblinda):

        Vad: Som du redan identifierat – använd aldrig enbart färg för att förmedla information.

        Hur för dig: Din lösning med ikoner (✓ och ✗) är perfekt. Se till att teckenförklaringen också är tydlig.

    Möjlighet att förstora text:

        Vad: Användare måste kunna zooma in i webbläsaren (upp till 200%) utan att sidan blir oläslig eller att funktioner försvinner.

        Hur för dig: Använd relativa enheter (som rem) för textstorlek istället för pixlar (px). Testa att zooma in på din sida – är allt fortfarande läsbart och fungerar kalendern?

## 2. För användare med motoriska funktionsnedsättningar

Detta handlar om att inte kräva en mus eller precisa rörelser.

    Fullständig tangentbordsnavigation:

        Vad: Alla funktioner måste kunna användas med enbart tangentbordet (främst Tab, Shift+Tab, Enter, Space och piltangenterna).

        Hur för dig:

            Testa själv: Kan du logga in, byta månad och välja ett datum utan att röra musen?

            Synlig fokusmarkering: När du navigerar med Tab-tangenten måste det alltid vara tydligt vilket element som är i fokus. Webbläsare har en inbyggd (ofta en blå ram), se till att du inte tar bort den med CSS (outline: none;) utan att ersätta den med något ännu tydligare.

            Logisk ordning: Tab-ordningen måste följa den visuella ordningen på sidan.

    Stora klickytor:

        Vad: Knappar och länkar ska vara tillräckligt stora för att vara lätta att träffa, även för någon med darrande händer eller nedsatt motorik.

        Hur för dig: Din kalender med stora, tydliga datum är redan ett utmärkt exempel på detta! Se till att alla knappar är lika generösa i storlek.

## 3. För användare med kognitiva och neurologiska funktionsnedsättningar

Detta handlar om tydlighet, förutsägbarhet och att minska stress.

    Tydligt och enkelt språk:

        Vad: Undvik jargong och komplicerade meningar. Var rak och tydlig.

        Hur för dig: Dina förslag på texter som "Steg 1: Välj ett datum" och en tydlig teckenförklaring är precis rätt.

    Förutsägbar design:

        Vad: Navigation och layout ska vara konsekvent på hela webbplatsen. En knapp som ser ut på ett visst sätt ska alltid göra samma typ av sak.

        Hur för dig: Se till att bokningsflödet är logiskt. När användaren klickar på ett datum, vad händer? Är nästa steg tydligt? Led användaren genom processen.

    Tydlig feedback:

        Vad: När användaren gör något måste systemet ge omedelbar och tydlig feedback.

        Hur för dig:

            Felmeddelanden: Om en användare försöker boka en upptagen tid, visa ett tydligt, hjälpsamt felmeddelande (t.ex. "Tyvärr, den tiden blev precis bokad. Välj en annan.").

            Bekräftelse: När en bokning är klar, visa en stor och tydlig bekräftelsesida: "Tack! Din bokning av Wilmer 1 är bekräftad."

Sammanfattning för ditt bokningssystem:

    Inloggning: Tydlig <h1>, <label> för fältet, <button> för knappen. Allt ska kunna nås med tangentbord.

    Kalender:

        Varje datum är en <button>.

        Varje knapp har en aria-label som beskriver datum och status (t.ex. "21 oktober, fullbokad").

        Använd ikoner (✓/✗) utöver färg för status.

        Pilarna för att byta månad är knappar med aria-label.

        Hela kalendern kan navigeras med piltangenter (om du bygger den som en riktig ARIA-widget) eller Tab-tangenten.

    Bokningsvy (efter valt datum):

        Visa lediga tider som tydliga knappar.

        När en bokning är gjord, ge en tydlig bekräftelse.