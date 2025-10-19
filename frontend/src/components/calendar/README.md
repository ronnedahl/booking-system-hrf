# Calendar Module

Refaktorerad kalenderkomponent uppdelad i modulära, testbara delar.

## Struktur

```
calendar/
├── index.ts                 # Centraliserad export
├── types.ts                 # TypeScript interfaces
├── calendarHelpers.ts       # Rena utility-funktioner
├── useCalendar.ts           # Custom hook för state management
├── CalendarHeader.tsx       # Månadsnavigering
├── CalendarGrid.tsx         # Huvudgrid med dagar
├── CalendarDay.tsx          # Individuell dagcell
└── README.md               # Denna fil
```

## Komponenter

### CalendarHeader
**Syfte**: Visa aktuell månad/år med navigation

**Props**:
- `month`: Aktuell månad (1-12)
- `year`: Aktuellt år
- `monthNames`: Array med månadsnamn
- `loading`: Laddningsstatus
- `onPreviousMonth`: Callback för föregående månad
- `onNextMonth`: Callback för nästa månad

**Användning**:
```tsx
<CalendarHeader
  month={10}
  year={2025}
  monthNames={MONTH_NAMES}
  loading={false}
  onPreviousMonth={() => {}}
  onNextMonth={() => {}}
/>
```

### CalendarGrid
**Syfte**: Huvudgrid som visar alla dagar i månaden

**Props**:
- `year`: Aktuellt år
- `month`: Aktuell månad (1-12)
- `weekDays`: Array med veckodagar
- `monthNames`: Array med månadsnamn
- `daysInMonth`: Antal dagar i månaden
- `firstDayOfMonth`: Första dagen i månaden (0-6)
- `bookings`: Array med bokningar
- `onDayClick`: Callback när en dag klickas

**Användning**:
```tsx
<CalendarGrid
  year={2025}
  month={10}
  weekDays={['Mån', 'Tis', ...]}
  monthNames={MONTH_NAMES}
  daysInMonth={31}
  firstDayOfMonth={2}
  bookings={[]}
  onDayClick={(day) => {}}
/>
```

### CalendarDay
**Syfte**: Individuell dagcell med bokningsindikatorer

**Props**:
- `day`: Dagnummer (1-31)
- `isPast`: Om dagen är i det förflutna
- `isToday`: Om dagen är idag
- `fullyBooked`: Om dagen är fullbokad
- `bookings`: Bokningar för denna dag
- `ariaLabel`: Tillgänglig label för skärmläsare
- `onClick`: Click-handler
- `onKeyDown`: Keyboard-handler

**Användning**:
```tsx
<CalendarDay
  day={15}
  isPast={false}
  isToday={true}
  fullyBooked={false}
  bookings={[]}
  ariaLabel="15 oktober 2025, idag, 2 bokningar"
  onClick={() => {}}
  onKeyDown={(e) => {}}
/>
```

## Hooks

### useCalendar
**Syfte**: Hanterar all kalenderlogik och state

**Returns**:
```typescript
{
  // State
  year: number
  month: number
  bookings: Booking[]
  loading: boolean
  error: string
  announcement: string

  // Constants
  monthNames: string[]
  daysInMonth: number
  firstDayOfMonth: number

  // Actions
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  handleDayClick: (day: number) => void
}
```

**Användning**:
```tsx
const calendar = useCalendar()

// Navigera till föregående månad
calendar.goToPreviousMonth()

// Klicka på dag 15
calendar.handleDayClick(15)
```

## Utility Functions

### calendarHelpers

**getDaysInMonth(year, month)**
- Beräknar antal dagar i en månad

**getFirstDayOfMonth(year, month)**
- Returnerar första veckodagen (0-6, justerat för Måndag = 0)

**getBookingsForDate(bookings, year, month, day)**
- Filtrerar bokningar för ett specifikt datum

**isFullyBooked(bookings, year, month, day)**
- Kontrollerar om en dag är fullbokad (≥2 bokningar)

**getDayAriaLabel(day, month, year, monthNames, bookings, isPast, isToday)**
- Genererar tillgänglig label för skärmläsare

**isPastDate(day, month, year)**
- Kontrollerar om ett datum är i det förflutna

**isToday(day, month, year)**
- Kontrollerar om ett datum är idag

## Fördelar med refaktorering

### ✅ Modularitet
- Varje komponent har ett tydligt ansvarsområde
- Lättare att hitta och fixa buggar
- Enklare att testa individuella delar

### ✅ Återanvändbarhet
- Komponenter kan återanvändas i andra delar av applikationen
- Helper-funktioner är rena funktioner som kan användas överallt

### ✅ Testbarhet
- Rena funktioner är lätta att enhetstesta
- Komponenter kan testas isolerat
- Custom hook kan testas separat

### ✅ Underhållbarhet
- Mindre filer är lättare att förstå
- Tydlig separation mellan logik och presentation
- Dokumentation är enklare att upprätthålla

### ✅ Prestanda
- Komponenter kan optimeras individuellt med React.memo
- Lättare att identifiera prestandaproblem
- Custom hook gör state management mer effektivt

## Migreringsplan

1. **Testa refaktorerad version**
   - Importera `CalendarView.refactored.tsx` i App.tsx
   - Verifiera att all funktionalitet fungerar

2. **Backup original**
   - Spara `CalendarView.tsx` som `CalendarView.old.tsx`

3. **Replace**
   - Byt ut innehållet i `CalendarView.tsx` med refaktorerad version

4. **Cleanup**
   - Ta bort `.old.tsx` när allt är verifierat

## Exempel på användning

```tsx
import CalendarView from './components/CalendarView'

function App() {
  return (
    <div>
      <CalendarView />
    </div>
  )
}
```

## Framtida förbättringar

- [ ] Lägg till enhetstester för alla funktioner
- [ ] Implementera React.memo för prestandaoptimering
- [ ] Extrahera månadsnamn till i18n-system
- [ ] Lägg till stöd för olika tidsformat
- [ ] Implementera virtualisering för stora kalendrar
