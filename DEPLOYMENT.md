# Deployment Guide för one.com (fastai.se)

## Förberedelser

### 1. Bygg Frontend
```bash
cd frontend
npm run build
```

Detta skapar en `dist/` mapp med optimerade filer.

## Deployment till one.com

### Steg 1: Förbered filer för uppladdning

Ladda upp följande filer/mappar via FTP eller one.com File Manager:

```
public_html/
├── .htaccess                    # Root .htaccess (från projektets root)
├── index.html                   # Från frontend/dist/
├── assets/                      # Från frontend/dist/assets/
│   ├── index-*.css
│   ├── index-*.js
│   └── logga-*.png
├── backend/
│   ├── .htaccess               # Backend .htaccess
│   ├── .env                     # Backend miljövariabler
│   ├── api/
│   │   ├── login.php
│   │   ├── getBookings.php
│   │   ├── createBooking.php
│   │   ├── deleteBooking.php
│   │   ├── getBookingHistory.php
│   │   └── admin/
│   │       ├── getAssociations.php
│   │       ├── createAssociation.php
│   │       ├── deleteAssociation.php
│   │       └── updateAssociationPassword.php
│   ├── config/
│   │   ├── config.php
│   │   └── auth.php
│   └── sql/
│       └── production-setup.sql  # För att sätta upp databasen
```

### Steg 2: Konfigurera .env

Redigera `backend/.env` med one.com's databasuppgifter:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=c9mzng9ga_bookingdb
DB_USER=c9mzng9ga_bookingdb
DB_PASS=media100

ENVIRONMENT=production

# Admin API Key
ADMIN_API_KEY=Xk9mP1vL8qR$5nW@3hT7jY!dF4zB6uC

# CORS - Production domain
ALLOWED_ORIGIN=https://fastai.se
```

### Steg 3: Sätt upp databasen

1. Logga in på one.com's phpMyAdmin
2. Välj databasen `c9mzng9ga_bookingdb`
3. Kör SQL-scriptet från `backend/sql/production-setup.sql`

Detta skapar:
- 4 tabeller (associations, admin_credentials, rooms, bookings)
- 2 rum (Wilmer 1, Wilmer 2)
- 8 föreningar
- Admin-användare

**Test-lösenord:**
- Admin: `admin123`
- Alla föreningar: `petertestar`

### Steg 4: Verifiera filrättigheter

Säkerställ att följande rättigheter är korrekt (via FTP eller File Manager):

```
backend/.env              → 644 (läsbar)
backend/api/*.php         → 644
backend/config/*.php      → 644
.htaccess                 → 644
backend/.htaccess         → 644
```

### Steg 5: Testa deployment

1. **Frontend**: Besök `https://fastai.se`
   - Ska visa inloggningssidan

2. **API Test**: Testa login endpoint
   ```bash
   curl -X POST https://fastai.se/api/login.php \
     -H "Content-Type: application/json" \
     -d '{"code": "admin123"}'
   ```

   Förväntat svar:
   ```json
   {"success":true,"role":"admin","message":"Admin logged in successfully"}
   ```

3. **Login i webbläsaren**:
   - Admin: `admin123`
   - Förening: `petertestar`

## Felsökning

### Problem: 500 Internal Server Error

**Lösning 1: Kontrollera .htaccess**
- Se till att `.htaccess` filerna är korrekt uppladdade
- Kontrollera att PHP-versionen är 8.x (one.com control panel)

**Lösning 2: Kontrollera filrättigheter**
- `.env` ska vara läsbar (644)
- PHP-filer ska vara läsbara (644)

**Lösning 3: Kontrollera error logs**
```
/home/c9mzng9ga/logs/php_errors.log
```

### Problem: CORS errors

**Kontrollera:**
1. `backend/.env` har rätt `ALLOWED_ORIGIN=https://fastai.se`
2. `backend/config/config.php` innehåller `https://fastai.se` i `$allowedOrigins` array

### Problem: Database connection failed

**Kontrollera:**
1. Databasnamn, användarnamn och lösenord i `backend/.env`
2. Att databasen existerar i phpMyAdmin
3. Att SQL-scriptet har körts korrekt

### Problem: Session cookies fungerar inte

**Kontrollera:**
1. Att `session.cookie_secure = 1` är satt i `.htaccess` (för HTTPS)
2. Att frontend gör requests med `credentials: 'include'`
3. Att CORS headers inkluderar `Access-Control-Allow-Credentials: true`

## Viktiga säkerhetsnoteringar

### För production (efter testning):

1. **Byt admin-lösenord**
   ```sql
   UPDATE admin_credentials
   SET password_hash = '$2y$10$...'
   WHERE id = 1;
   ```

2. **Byt föreningslösenord**
   Via admin-panelen eller direkt i databasen.

3. **Uppdatera ADMIN_API_KEY** i `.env`

4. **Aktivera HTTPS-only**
   - One.com tillhandahåller gratis SSL
   - Certifikatet förnyas automatiskt

## Backup-rutin

### Databas backup via phpMyAdmin
1. Logga in på phpMyAdmin
2. Välj `c9mzng9ga_bookingdb`
3. Klicka på "Export"
4. Välj "SQL" format
5. Spara filen lokalt

### Automatisk backup (rekommenderat)
One.com har inbyggd backup som sparar dagligen. Kontrollera i control panel under "Backups".

## Uppdatera applikationen

### Frontend-uppdatering
```bash
cd frontend
npm run build
```

Ladda upp nya filer från `dist/` till `public_html/`:
- `index.html` (ersätt)
- `assets/*` (lägg till nya, behåll gamla för cache)

### Backend-uppdatering
Ladda upp ändrade PHP-filer till `public_html/backend/`

**OBS:** Rör INTE `.env` filen om den redan är konfigurerad!

## Kontaktinformation

- **Domän**: fastai.se
- **Hosting**: one.com
- **Database**: c9mzng9ga_bookingdb
- **PHP Version**: 8.x

## Checklista för deployment

- [ ] Frontend byggd (`npm run build`)
- [ ] Alla filer uppladdade via FTP/File Manager
- [ ] `.env` konfigurerad med rätt databasuppgifter
- [ ] SQL-script körd i phpMyAdmin
- [ ] Filrättigheter verifierade (644)
- [ ] Frontend testad (https://fastai.se)
- [ ] API testad (curl eller browser)
- [ ] Login testad (admin123 och petertestar)
- [ ] Bokning testad (skapa och visa bokningar)
- [ ] Admin-panel testad

## Support

Vid problem, kontrollera:
1. Error logs i one.com control panel
2. Browser console för JavaScript-fel
3. Network tab i DevTools för API-anrop
