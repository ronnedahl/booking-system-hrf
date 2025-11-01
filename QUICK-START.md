# Quick Start Guide - Deployment till one.com

## 🚀 Snabb översikt

Denna guide tar dig från nuvarande tillstånd till live på fastai.se på 10 minuter.

## ✅ Förberedelser (redan klart!)

- ✅ Frontend byggd (`frontend/dist/`)
- ✅ Deployment-paket skapat (`deploy-package/`)
- ✅ CORS konfigurerat för fastai.se
- ✅ .htaccess-filer skapade
- ✅ SQL-script förberett med test-lösenord

## 📦 Vad finns i deploy-package/?

```
deploy-package/
├── index.html              # React app entry point
├── assets/                 # JS, CSS, images
├── backend/
│   ├── .env               # Databasuppgifter
│   ├── .htaccess          # PHP säkerhet
│   ├── api/               # Alla API endpoints
│   ├── config/            # Konfiguration
│   └── sql/               # production-setup.sql
└── .htaccess              # Root routing
```

## 🔧 Deployment-steg (5 min)

### 1. Ladda upp filer till one.com

**Via FTP:**
```
Host: ftp.fastai.se
User: c9mzng9ga
Port: 21
```

**Eller via one.com Control Panel → File Manager**

**Ladda upp:**
- `deploy-package/*` → `public_html/`

### 2. Verifiera backend/.env

Kontrollera att `public_html/backend/.env` innehåller:
```env
DB_HOST=localhost
DB_NAME=c9mzng9ga_bookingdb
DB_USER=c9mzng9ga_bookingdb
DB_PASS=media100
ALLOWED_ORIGIN=https://fastai.se
```

### 3. Sätt upp databasen

1. Logga in på **one.com Control Panel**
2. Gå till **phpMyAdmin**
3. Välj databas `c9mzng9ga_bookingdb`
4. Klicka **Import** → Välj `backend/sql/production-setup.sql`
5. Kör scriptet

### 4. Testa!

**Frontend:**
```
https://fastai.se
```

**API Test:**
```bash
curl -X POST https://fastai.se/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "admin123"}'
```

**Förväntat svar:**
```json
{"success":true,"role":"admin","message":"Admin logged in successfully"}
```

## 🔑 Test-lösenord

- **Admin**: `admin123`
- **Alla 8 föreningar**: `petertestar`

## ✅ Checklista

- [ ] Filer uppladdade till `public_html/`
- [ ] `.env` verifierad med rätt databasuppgifter
- [ ] SQL-script körd i phpMyAdmin
- [ ] Testat `https://fastai.se` i webbläsare
- [ ] Testat login med `admin123`
- [ ] Testat login med `petertestar`

## 🐛 Vanliga problem

### "500 Internal Server Error"
→ Kontrollera att `.htaccess` finns i både root och backend/
→ Kontrollera PHP-versionen (ska vara 8.x)

### "Database connection failed"
→ Verifiera databasuppgifter i `backend/.env`
→ Kontrollera att SQL-scriptet körts

### "CORS error"
→ Kontrollera att `ALLOWED_ORIGIN=https://fastai.se` i `.env`

### Login fungerar inte
→ Kontrollera att SQL-scriptet körts korrekt
→ Testa med både `admin123` och `petertestar`

## 📚 Mer information

- **DEPLOYMENT.md** - Fullständig deployment-guide
- **CLAUDE.md** - Utvecklingsdokumentation
- **TILLGÄNGLIGHET.md** - Tillgänglighetsstandard

## 🎯 Efter lyckad deployment

1. Testa alla funktioner:
   - Login (admin + förening)
   - Kalendervy
   - Skapa bokning
   - Visa bokningar
   - Ta bort bokning
   - Bokningshistorik
   - Admin-panel

2. När allt fungerar:
   - Byt admin-lösenord (via phpMyAdmin)
   - Byt föreningslösenord (via admin-panel)
   - Sätt upp regelbunden backup-rutin

## 🆘 Support

Om något inte fungerar:
1. Kontrollera error logs i one.com Control Panel
2. Öppna Browser DevTools (F12) → Console & Network tabs
3. Se DEPLOYMENT.md för felsökning

---

**Lycka till! 🚀**
