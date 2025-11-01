# One.com Deployment Checklist - Manual Setup

## ✅ Nuvarande Struktur (KORREKT!)

Din one.com struktur ser ut så här:
```
public_html/ (root på fastai.se)
├── assets/           ✅ Frontend assets
├── backend/          ✅ Backend folder
├── .htaccess         ✅ Root routing
├── index.html        ✅ React app
├── vite.svg          ✅ Vite icon
└── db-test.php       📝 Test-fil
```

## 📋 Steg för att få det att fungera

### 1. Kontrollera backend-struktur

Gå in i `backend/` foldern på one.com och verifiera att du har:

```
backend/
├── .env              ← VIKTIGT! Måste finnas
├── .htaccess         ← Säkerhet
├── api/
│   ├── login.php
│   ├── getBookings.php
│   ├── createBooking.php
│   ├── deleteBooking.php
│   ├── getBookingHistory.php
│   └── admin/
│       ├── getAssociations.php
│       ├── createAssociation.php
│       ├── deleteAssociation.php
│       └── updateAssociationPassword.php
├── config/
│   ├── config.php
│   └── auth.php
└── sql/
    └── production-setup.sql
```

### 2. Skapa/Uppdatera backend/.env

Skapa en fil `backend/.env` med detta innehåll:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=c9mzng9ga_bookingdb
DB_USER=c9mzng9ga_bookingdb
DB_PASS=media1002

ENVIRONMENT=production

# Admin API Key
ADMIN_API_KEY=Xk9mP1vL8qR$5nW@3hT7jY!dF4zB6uC

# CORS - Production domain
ALLOWED_ORIGIN=https://fastai.se
```

### 3. Uppdatera root .htaccess

Ersätt din nuvarande `.htaccess` i root med:

```apache
# Root .htaccess för one.com (fastai.se)
# Hanterar routing mellan frontend och backend

RewriteEngine On

# Security: Block access to sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Block access to backend .env
RewriteRule ^backend/\.env$ - [F,L]

# API requests go to backend
# /api/login.php → backend/api/login.php
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ backend/api/$1 [L,QSA]

# Serve static files if they exist (assets, etc)
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# SPA fallback - serve index.html for client-side routing
# This catches all other requests (/, /calendar, /schedule/*, etc)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ /index.html [L]
```

### 4. Kontrollera backend/.htaccess

Filen `backend/.htaccess` ska innehålla:

```apache
# Backend .htaccess för one.com
# Hanterar API routing och säkerhet

# Enable rewrite engine
RewriteEngine On

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Disable directory browsing
Options -Indexes

# Block access to sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

<FilesMatch "\.env$">
    Order allow,deny
    Deny from all
</FilesMatch>

# PHP settings
<IfModule mod_php8.c>
    php_value display_errors 0
    php_value log_errors 1
    php_value session.cookie_httponly 1
    php_value session.cookie_secure 1
    php_value session.cookie_samesite Lax
</IfModule>
```

### 5. Kör SQL-script i phpMyAdmin

1. Gå till **one.com Control Panel** → **Databases** → **phpMyAdmin**
2. Välj databas: `c9mzng9ga_bookingdb`
3. Klicka på **SQL** fliken
4. Kopiera innehållet från `backend/sql/production-setup.sql`
5. Klistra in och klicka **Go**

SQL-scriptet skapar:
- ✅ 4 tabeller (associations, admin_credentials, rooms, bookings)
- ✅ 2 rum (Wilmer 1, Wilmer 2)
- ✅ 8 föreningar med lösenord
- ✅ Admin-konto

### 6. Testa API

**Test 1: Enkel PHP-test**
```
https://fastai.se/test-api.php
```
Förväntat: `{"status":"ok","message":"PHP is working!",...}`

**Test 2: API Login (Admin)**
```bash
curl -X POST https://fastai.se/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "admin123"}'
```

Förväntat:
```json
{"success":true,"role":"admin","message":"Admin logged in successfully"}
```

**Test 3: API Login (Förening)**
```bash
curl -X POST https://fastai.se/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "petertestar"}'
```

Förväntat:
```json
{"success":true,"role":"user","associationId":1,"associationName":"Förening A"}
```

### 7. Testa Frontend

Gå till:
```
https://fastai.se
```

Du ska se:
- ✅ Inloggningssidan
- ✅ Logotyp
- ✅ Inmatningsfält för kod

Testa login:
- **Admin**: `admin123` → Ska gå till admin-panel
- **Förening**: `petertestar` → Ska gå till kalender

## 🐛 Felsökning

### Problem: "Database connection failed"

**Lösning:**
1. Kontrollera att `backend/.env` har rätt uppgifter:
   - `DB_PASS=media1002` (observera slutet med 2)
2. Testa databaskoppling med `db-test.php`
3. Verifiera att databasen existerar i phpMyAdmin

### Problem: "404 Not Found" på /api/login.php

**Lösning:**
1. Kontrollera att `.htaccess` finns i root
2. Kontrollera att `backend/api/login.php` finns
3. Kontrollera filrättigheter (ska vara 644)

### Problem: "CORS error" i browser console

**Lösning:**
1. Öppna `backend/.env` och verifiera:
   ```
   ALLOWED_ORIGIN=https://fastai.se
   ```
2. Öppna `backend/config/config.php` och kontrollera att `https://fastai.se` finns i `$allowedOrigins` array

### Problem: "500 Internal Server Error"

**Lösning:**
1. Kontrollera PHP error logs i one.com Control Panel
2. Kontrollera att PHP-versionen är 8.x (Control Panel → PHP Settings)
3. Kontrollera syntax i `.htaccess` filer

### Problem: Login fungerar inte

**Lösning:**
1. Kontrollera att SQL-scriptet körts korrekt
2. Testa lösenorden:
   - Admin: `admin123`
   - Föreningar: `petertestar`
3. Kontrollera i phpMyAdmin att tabellerna finns:
   - `admin_credentials` (ska ha 1 rad)
   - `associations` (ska ha 8 rader)

## 📝 Snabb Verifiering

Kör dessa tester i ordning:

1. ✅ `https://fastai.se/test-api.php` → PHP fungerar
2. ✅ `https://fastai.se` → Frontend laddas
3. ✅ `https://fastai.se/api/login.php` (POST med curl) → API fungerar
4. ✅ Login med `admin123` i browser → Auth fungerar
5. ✅ Login med `petertestar` i browser → Förening fungerar

## 🔑 Test-lösenord (Viktiga!)

- **Admin**: `admin123`
- **Alla 8 föreningar**: `petertestar`

## 📂 Filer att ladda upp från lokalt projekt

Om något saknas, ladda upp från ditt lokala projekt:

**Frontend:**
```
frontend/dist/index.html → root/index.html
frontend/dist/assets/* → root/assets/
```

**Backend:**
```
backend/.env → backend/.env
backend/.htaccess → backend/.htaccess
backend/api/* → backend/api/*
backend/config/* → backend/config/*
backend/sql/* → backend/sql/*
```

**Root:**
```
.htaccess → root/.htaccess
```

## ✅ Färdig!

När alla test fungerar, är du redo att använda systemet! 🎉
