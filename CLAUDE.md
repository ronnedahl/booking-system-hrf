# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektöversikt

Ett webbaserat bokningssystem där föreningar kan boka tider i lokaler. Systemet har användarinloggning med föreningskoder och ett adminpanel för hantering av föreningar och deras koder.

## Teknisk Stack

**Backend**: PHP 8.x + MySQL 8.0+ | RESTful JSON API | Session-based auth eller JWT
**Frontend**: React 18 + TypeScript + Vite | Tailwind CSS | react-router-dom
**Utveckling**: json-server för mock API

## Snabbkommandon

### Initial Setup (Sprint 1)
```bash
# Frontend setup
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom

# Tailwind CSS konfiguration
# Uppdatera tailwind.config.js content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
# Lägg till Tailwind directives i src/index.css

# Mock API setup
npm install -D json-server
# Skapa db.json med mock data (se struktur nedan)
npx json-server --watch db.json --port 3001

# Starta utvecklingsserver
npm run dev  # Kör på localhost:5173
```

### Backend Setup
```bash
# MySQL databas
mysql -u root -p
CREATE DATABASE kanban_booking;
USE kanban_booking;
SOURCE backend/sql/schema.sql;

# PHP server (från backend-mappen)
php -S localhost:8000 -t .
```

### Testa API
```bash
# Login test
curl -X POST http://localhost:8000/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'

# Hämta bokningar
curl http://localhost:8000/api/getBookings.php?year=2025&month=11
```

## Projektstruktur

```
handicapp-booking/
├── backend/
│   ├── api/
│   │   ├── index.php                         # Central router
│   │   ├── login.php                         # POST: Autentisering för users/admin
│   │   ├── getBookings.php                   # GET: Hämta bokningar för månad
│   │   ├── createBooking.php                 # POST: Skapa ny bokning
│   │   └── admin/
│   │       ├── getAssociations.php           # GET: Lista föreningar (Bearer auth)
│   │       └── updateAssociationPassword.php # POST: Uppdatera föreningskod
│   ├── config/
│   │   ├── config.php                        # PDO databas + CORS (localhost:5173)
│   │   └── auth.php                          # Auth helpers (session/JWT)
│   └── sql/
│       └── schema.sql                        # Databas-schema med initiala data
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx                     # Centrerad login-box, Tailwind styled
│   │   │   ├── CalendarView.tsx              # Månadsöversikt, 7-kolumn grid
│   │   │   ├── ScheduleView.tsx              # Dagsschema med timeslots
│   │   │   ├── BookingModal.tsx              # Bokningsformulär
│   │   │   └── AdminPage.tsx                 # Admin: lista/uppdatera föreningar
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx               # Global auth state (role, token, associationId)
│   │   ├── App.tsx                           # Router setup
│   │   └── main.tsx                          # Entry point
│   ├── db.json                               # Mock data för json-server
│   ├── .env.development                      # VITE_API_URL=http://localhost:3001
│   └── .env.production                       # VITE_API_URL=production-url
└── CLAUDE.md
```

## Arkitektur & Designmönster

### Backend: PHP API Pattern
- **Central Router**: `api/index.php` dirigerar requests till rätt endpoint
- **PDO**: Databas-access med prepared statements
- **CORS**: Headers tillåter `localhost:5173` (Vite dev server)
- **Error Handling**: try-catch med JSON-felmeddelanden
- **Auth**: `password_hash()` / `password_verify()` för lösenord, Bearer token för admin

### Frontend: React Architecture
- **Auth Flow**: `AuthContext` → protected routes → role-based navigation (`/calendar` eller `/admin`)
- **State Management**: React Context för auth, useState för lokal state
- **Routing**: react-router-dom med protected routes baserat på auth state
- **API Integration**: Fetch mot backend API, miljövariabler via import.meta.env.VITE_API_URL
- **Styling**: Tailwind utility classes, responsive design

### Dataflöde
```
User → Login.tsx → POST /api/login.php → AuthContext (update state)
     → Navigate to /calendar (user) eller /admin (admin)

User → CalendarView → GET /api/getBookings.php?year=X&month=Y
     → Render grid med visuell feedback (grön=ledig, röd=fullbokad)
     → Click dag → Navigate to /schedule/:date

User → ScheduleView → Click timeslot → BookingModal
     → Submit → POST /api/createBooking.php → Uppdatera UI

Admin → AdminPage → GET /api/admin/getAssociations.php (Bearer token)
      → Update kod → POST /api/admin/updateAssociationPassword.php
```

## API Specifikationer

### POST /api/login.php
```json
Request: { "code": "ABC123" }
Response (user): { "success": true, "role": "user", "associationId": 1, "associationName": "Förening A" }
Response (admin): { "success": true, "role": "admin" }
Response (fail): { "success": false, "error": "Invalid code" }
```

### GET /api/getBookings.php?year=2025&month=11
```json
Response: [
  {
    "id": 1, "date": "2025-11-15", "roomId": 1, "roomName": "Lokal A",
    "startTime": "10:00", "endTime": "11:00", "duration": 60,
    "userFirstname": "Anna", "associationId": 1, "associationName": "Förening A"
  }
]
```

### POST /api/createBooking.php
```json
Request: { "date": "2025-11-15", "roomId": 1, "startTime": "10:00", "duration": 60, "userFirstname": "Anna", "associationId": 1 }
Response (success): { "success": true, "booking": { "id": 123, ... } }
Response (fail): { "success": false, "error": "Time slot already booked" }

Valideringar:
- Datum inte i förflutet
- Rum existerar
- Ingen överlappning med andra bokningar
- StartTime inom öppettider (09:00-17:00)
- Duration: 30, 60, 90, eller 120 minuter
```

### GET /api/admin/getAssociations.php
```
Headers: Authorization: Bearer SECRET_API_KEY
Response: [{ "id": 1, "name": "Förening A", "createdAt": "2025-01-01" }]
```

### POST /api/admin/updateAssociationPassword.php
```json
Headers: Authorization: Bearer SECRET_API_KEY
Request: { "associationId": 1, "newPassword": "NEW123" }
Response: { "success": true, "message": "Password updated successfully" }
```

## Databas Schema

```sql
-- 4 tabeller: associations, admin_credentials, rooms, bookings

CREATE TABLE associations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,  -- password_hash() result
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admin_credentials (
  id INT PRIMARY KEY DEFAULT 1,
  password_hash VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (id = 1)  -- Endast en admin
);

CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  room_id INT NOT NULL,
  start_time TIME NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in minutes',
  user_firstname VARCHAR(50) NOT NULL,
  association_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  INDEX idx_date_room (date, room_id),
  INDEX idx_association (association_id)
);
```

## Mock Data (db.json för json-server)

```json
{
  "bookings": [
    {
      "id": 1,
      "date": "2025-11-15",
      "roomId": 1,
      "startTime": "10:00",
      "duration": 60,
      "userFirstname": "Anna",
      "associationId": 1
    }
  ],
  "associations": [
    { "id": 1, "name": "Förening A", "code": "ABC123" }
  ],
  "rooms": [
    { "id": 1, "name": "Lokal A", "capacity": 20 }
  ]
}
```

## Miljövariabler

### Backend (.env eller direkt i config.php)
```env
DB_HOST=localhost
DB_NAME=kanban_booking
DB_USER=root
DB_PASS=your_password
ADMIN_API_KEY=your-secret-admin-key-here
JWT_SECRET=your-jwt-secret-here (optional)
```

### Frontend
```env
# .env.development
VITE_API_URL=http://localhost:3001
VITE_ADMIN_TOKEN=dev-secret-123

# .env.production
VITE_API_URL=http://yourdomain.com/backend/api
VITE_ADMIN_TOKEN=production-secret-xyz
```

## Sprint-plan (Referens)

1. **Sprint 1**: Projektgrund & Arkitektur (1-2 dagar)
   - Skapa mappar, PHP API-struktur, React Vite setup, Tailwind, Router, Mock API

2. **Sprint 2**: Autentisering (2-3 dagar)
   - DB-schema, login.php, Login.tsx, AuthContext, Protected routes

3. **Sprint 3**: Kalendervy (2-3 dagar)
   - getBookings.php, CalendarView, månadsnavigering, visuell feedback

4. **Sprint 4**: Dagsschema & Bokning (3-4 dagar)
   - createBooking.php, validering, ScheduleView, BookingModal

5. **Sprint 5**: Adminpanel (2-3 dagar)
   - Admin endpoints, säkerhet, AdminPage, lista/uppdatera föreningar

## Utvecklingsriktlinjer

### Säkerhet
- Backend: Använd `password_hash()` och `password_verify()` för lösenord
- Admin endpoints: Validera Bearer token mot miljövariabel
- CORS: Endast tillåt localhost:5173 i utveckling
- Input validering: Sanitera och validera alla inputs server-side

### Routing
- `/` - Login (public)
- `/calendar` - Kalendervy (protected, user/admin)
- `/schedule/:date` - Dagsschema (protected, user/admin)
- `/admin` - Adminpanel (protected, admin only)

### React Komponenter
- **Login.tsx**: Centrerad login-box, error/loading states, Tailwind styled
- **CalendarView.tsx**: 7-kolumn grid (Mån-Sön), prev/next månadsnavigering, visuell feedback för status
- **ScheduleView.tsx**: Timeslots (09:00-17:00, 30min intervall), rum-kolumner, klickbara lediga slots
- **BookingModal.tsx**: Form med förnamn, rum (dropdown), varaktighet (select), submit → POST createBooking
- **AdminPage.tsx**: Lista föreningar, input för ny kod, uppdatera-knapp, logout

### Styling
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Visual indicators: Grön=ledig, Röd/Orange=fullbokad, Grå=förflutet/disabled
- Hover-effekter på klickbara element

## Vanliga Patterns

### Fetch från Frontend
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const response = await fetch(`${apiUrl}/api/login.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: userCode })
});
const data = await response.json();
```

### Protected Route Pattern
```typescript
// I App.tsx
<Route path="/calendar" element={
  <ProtectedRoute>
    <CalendarView />
  </ProtectedRoute>
} />
```

### Auth Context Pattern
```typescript
const { authState, setAuthState } = useAuth();
// authState: { isAuthenticated: boolean, role: 'user' | 'admin', associationId?: number }
```

## Git Strategi

### Branch-struktur
```
main → develop → feature/epic1-foundation
              → feature/epic2-auth
              → feature/epic3-calendar
              → feature/epic4-booking
              → feature/epic5-admin
```

### Commit-meddelanden
```
Epic 1: Create basic PHP API structure
Epic 1: Setup React Vite with TypeScript
Epic 2: Implement login endpoint
Epic 2: Create Login component with Tailwind
Epic 3: Add CalendarView with month navigation
```

## Testning

### Backend
- Postman/Insomnia för manuella API-tester
- Testa alla endpoints med olika inputs (success/fail cases)

### Frontend
- Manuell browser-testning
- Testa alla user flows: login → calendar → schedule → booking
- Testa admin flow: login → admin → uppdatera kod
- Testa error states och edge cases

## Framtida Features (Backlog)

- Email-bekräftelse vid bokning
- Radera/ändra bokning
- Återkommande bokningar
- Exportera bokningar till PDF
- Statistik över bokningar per förening
- Notiser för admin vid ny bokning
- Multi-språk support (Svenska/Engelska)
- Dark mode

---

**Version**: 1.0
**Status**: 🚀 Redo att börja implementera
