# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektöversikt

Ett webbaserat bokningssystem där handikappföreningar kan boka tider i lokaler. Systemet prioriterar tillgänglighet (WCAG 2.1) med särskild hänsyn till skärmläsaranvändare.

## Teknisk Stack

**Backend**: PHP 8.x + MySQL 8.0+ | RESTful JSON API | Session-based auth
**Frontend**: React 19 + TypeScript + Vite | Tailwind CSS 4 | react-router-dom
**Utveckling**: json-server för mock API under utveckling

## Utvecklingskommandon

### Frontend Development
```bash
# Från frontend/ katalog
npm install          # Installera dependencies
npm run dev          # Starta Vite dev server (localhost:5173)
npm run build        # TypeScript + Vite build
npm run lint         # ESLint kontroll
npm run mock-api     # Starta json-server (localhost:3001)
```

### Backend Development
```bash
# MySQL setup
mysql -u root -p
CREATE DATABASE kanban_booking;
SOURCE backend/sql/schema.sql;

# PHP server (från backend/ katalog)
php -S localhost:8000 -t .

# Testa API endpoints (från root katalog)
bash test-booking.sh              # Kör boknings-API tester
bash test-delete-booking.sh       # Testa delete bokning
bash test-admin-api.sh            # Testa admin endpoints
```

### API Testing Examples
```bash
# Login
curl -X POST http://localhost:8000/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'

# Skapa bokning (kräver session cookie från login)
curl -b /tmp/cookies.txt -X POST http://localhost:8000/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-15","roomId":1,"startTime":"10:00","duration":60,"userFirstname":"Anna","associationId":1}'
```

## Projektstruktur

```
handicapp-booking/
├── backend/
│   ├── api/
│   │   ├── login.php              # POST: Session-based auth (users + admin)
│   │   ├── getBookings.php        # GET: Hämta bokningar för månad
│   │   ├── createBooking.php      # POST: Skapa bokning med validering
│   │   ├── deleteBooking.php      # POST: Ta bort bokning med lösenord
│   │   ├── getBookingHistory.php  # GET: Sökbar bokningshistorik
│   │   └── admin/                 # Bearer auth required
│   │       ├── getAssociations.php
│   │       ├── createAssociation.php
│   │       ├── deleteAssociation.php
│   │       └── updateAssociationPassword.php
│   ├── config/
│   │   ├── config.php             # PDO connection + CORS + env vars
│   │   └── auth.php               # Auth helpers
│   └── sql/
│       └── schema.sql             # 4 tables: associations, admin_credentials, rooms, bookings
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx              # ARIA-enhanced login (se TILLGÄNGLIGHET.md)
│   │   │   ├── CalendarView.tsx       # Månadsvy med tillgänglighetsmarkering
│   │   │   ├── ScheduleView.tsx       # Dagsvy med tidsluckor och bokningsmodal
│   │   │   ├── BookingModal.tsx       # Modal för att skapa bokningar
│   │   │   ├── DeleteBookingModal.tsx # Modal för att ta bort bokningar med lösenord
│   │   │   ├── BookingHistory.tsx     # Sökbar bokningshistorik med filter
│   │   │   ├── BookingDetailsModal.tsx # Visa detaljer för specifik bokning
│   │   │   ├── OrganizationNav.tsx    # Navigation mellan kalender och historik
│   │   │   ├── AdminPage.tsx          # Admin dashboard för föreningar
│   │   │   └── calendar/              # Modular kalenderkomponenter
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Global auth: role, associationId, associationName
│   │   └── App.tsx                    # Router: /, /calendar, /schedule/:date, /history, /admin
│   └── package.json               # Scripts: dev, build, lint, mock-api
├── test-booking.sh                # Automated API test suite
├── TILLGÄNGLIGHET.md              # WCAG 2.1 compliance documentation
└── style.md                       # CSS reference för design system
```

## Arkitektur

### Backend: PHP API Design
- **Session-based Auth**: PHP sessions för user auth, Bearer token för admin endpoints
- **PDO**: Prepared statements för SQL-injection skydd
- **CORS**: Configurerat för Vite dev server (localhost:5173)
- **Modular Validation**: Separation av concerns i createBooking.php:
  - `validateBookingData()` - Field validation
  - `validateDate()` - Business logic (no past dates)
  - `validateBusinessHours()` - Time constraints (09:00-17:00)
  - `validateNoOverlap()` - Conflict detection
- **Error Handling**: Consistent JSON responses med HTTP status codes

### Frontend: React + TypeScript Pattern
- **Auth Context**: Central state för authentication (role, associationId, associationName)
- **Protected Routes**: `ProtectedRoute` wrapper validerar auth innan rendering
- **Role-based Navigation**: Users → /calendar, Admin → /admin
- **Environment Variables**: `import.meta.env.VITE_API_URL` för API base URL
- **CSS Modules**: Component-scoped styles (*.module.css)
- **Accessibility-first**: ARIA attributes, semantic HTML, WCAG 2.1 AA compliance (se TILLGÄNGLIGHET.md)

### Critical Data Flows
1. **Login Flow**: Login.tsx → POST /api/login.php → Session cookie → AuthContext update → Role-based redirect
2. **Booking Flow**: CalendarView → Select date → ScheduleView → BookingModal → POST /api/createBooking.php → Validation → DB insert
3. **Delete Flow**: ScheduleView → Click booked slot → DeleteBookingModal → Enter password → POST /api/deleteBooking.php → Verification → Delete
4. **History Flow**: OrganizationNav → BookingHistory → GET /api/getBookingHistory.php → Filter/search → Display results
5. **Admin Flow**: Admin login → Bearer token → GET/POST /api/admin/* endpoints

## API Kontrakt

### POST /api/login.php
**Auth**: None
**Request**: `{ "code": "ABC123" }`
**Response**:
- User: `{ "success": true, "role": "user", "associationId": 1, "associationName": "Förening A" }`
- Admin: `{ "success": true, "role": "admin" }`
- Fail: `{ "success": false, "error": "Invalid code" }` (400)

### POST /api/createBooking.php
**Auth**: Session cookie required
**Request**: `{ "date": "2025-11-15", "roomId": 1, "startTime": "10:00", "duration": 60, "userFirstname": "Anna", "associationId": 1 }`
**Validation Rules**:
- `date`: YYYY-MM-DD format, not in past
- `startTime`: HH:MM format, between 09:00-17:00
- `duration`: Must be 30, 60, 90, or 120 minutes
- `userFirstname`: Minimum 2 characters
- No time slot overlap with existing bookings

**Response**:
- Success: `{ "success": true, "booking": {...}, "message": "Booking created successfully" }` (201)
- Fail: `{ "success": false, "error": "Cannot book dates in the past" }` (400/409)

### GET /api/getBookings.php?year=2025&month=11
**Auth**: None
**Response**: Array of bookings med room/association names joined

### POST /api/deleteBooking.php
**Auth**: Session cookie required
**Request**: `{ "bookingId": 123, "password": "TEST123" }`
**Validation**: Password måste matcha association som skapade bokningen
**Response**:
- Success: `{ "success": true, "message": "Booking deleted successfully" }` (200)
- Fail: `{ "success": false, "error": "Invalid password" }` (403)

### GET /api/getBookingHistory.php?search=Anna&startDate=2025-01-01&endDate=2025-12-31
**Auth**: Session cookie required (user role)
**Query Parameters**:
- `search` (optional): Sök i förnamn, efternamn, lokalnamn
- `startDate` (optional): Filter från datum
- `endDate` (optional): Filter till datum
**Response**: Array of bookings med room names, filtrerad på associationId från session

### Admin Endpoints (Bearer Auth Required)
- **GET /api/admin/getAssociations.php**: Lista alla föreningar
- **POST /api/admin/createAssociation.php**: Skapa ny förening
- **POST /api/admin/deleteAssociation.php**: Ta bort förening
- **POST /api/admin/updateAssociationPassword.php**: Uppdatera föreningskod

## Databas Schema

**4 Tables**: associations, admin_credentials, rooms, bookings

**Key Relationships**:
- `bookings.room_id` → `rooms.id` (CASCADE)
- `bookings.association_id` → `associations.id` (CASCADE)
- `associations.code_hash` uses `password_hash()` (bcrypt)
- `admin_credentials` enforces single admin (CHECK id = 1)

**Important Indexes**:
- `idx_date_room` on bookings(date, room_id) - overlap detection performance
- `idx_association` on bookings(association_id) - association lookup

## Miljövariabler

### Backend (config.php läser från env)
```bash
DB_HOST=localhost
DB_NAME=kanban_booking
DB_USER=root
DB_PASS=your_password
ADMIN_API_KEY=your-secret-admin-key-here
ALLOWED_ORIGIN=http://localhost:5173  # CORS
```

### Frontend (.env.development / .env.production)
```bash
VITE_API_URL=http://localhost:3001      # Mock API under utveckling
VITE_API_URL=http://localhost:8000/api  # Real backend
```

## Viktiga Utvecklingsmönster

### PHP Backend Pattern
```php
// Modular validation (se createBooking.php)
$validationResult = validateBookingData($data);
if (!$validationResult['valid']) {
    sendErrorResponse($validationResult['error'], 400);
}

// Business hours validation (blockerar 09:00-10:00 och 12:00-13:00)
$timeValidation = validateBusinessHours($startTime, $duration);
if (!$timeValidation['valid']) {
    sendErrorResponse($timeValidation['error'], 400);
}

// Session auth check
session_start();
if (!isset($_SESSION['authenticated'])) {
    sendErrorResponse('Unauthorized', 401);
}
```

### React Fetch Pattern
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const response = await fetch(`${apiUrl}/api/endpoint.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // Send session cookie
  body: JSON.stringify(data)
});
```

### Protected Route Usage
```typescript
<Route path="/calendar" element={
  <ProtectedRoute>
    <CalendarView />
  </ProtectedRoute>
} />
```

## Tillgänglighet (WCAG 2.1 AA)

**Implemented** (Sprint 2):
- ARIA labels på formulär (`aria-label`, `aria-required`, `aria-invalid`)
- `role="alert"` för felmeddelanden
- `aria-live` regioner för dynamiska uppdateringar
- Semantisk HTML (main, region, form)
- High contrast: #005A9C on white (8.59:1)

**Planned** (Sprint 3-5):
- Tangentbordsnavigation (pilar, tab) för kalender
- Focus management för modals
- Screen reader announcements för state changes

Se **TILLGÄNGLIGHET.md** för fullständig dokumentation.

## Kodkvalitet & Säkerhet

### Säkerhet
- **SQL Injection**: PDO prepared statements obligatoriska
- **XSS**: JSON encoding för alla API responses
- **CSRF**: Session-based auth med SameSite cookies
- **Input Validation**: Server-side validation i modulariserade funktioner

### Code Organization
- **Backend**: Separation of concerns (validation, business logic, data access)
- **Frontend**: Component-scoped CSS modules, TypeScript för type safety
- **Testing**: `test-booking.sh` för automated API testing

## Viktiga Affärsregler (från booking.md)

- **Lokaler**: 2 st (Wilmer 1, Wilmer 2)
- **Föreningar**: 8 st, varje med unikt lösenord
- **Öppettider**: 08:00-22:00 (men se blockerade tider nedan)
- **Blockerade tider**: 09:00-10:00 och 12:00-13:00 (ej bokningsbara)
- **Bokningslängd**: Endast 1 timme åt gången (60 min)
- **Bokningsinformation**: För- och efternamn krävs vid bokning
- **Radering**: Kräver lösenord från skapande förening

## Git Workflow

**Main Branch**: main (används för PRs)

**Commit Style**:
```
Epic X: Brief description

- Bullet point details if needed
```

**Commit Co-Author**:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```
