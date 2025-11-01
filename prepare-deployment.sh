#!/bin/bash
# Prepare deployment package for one.com

echo "=========================================="
echo "   Förbereder deployment för one.com"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create deployment directory
DEPLOY_DIR="deploy-package"
echo -e "${YELLOW}Skapar deployment-mapp...${NC}"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}ERROR: frontend/dist finns inte!${NC}"
    echo "Kör först: cd frontend && npm run build"
    exit 1
fi

# Copy frontend dist files
echo -e "${YELLOW}Kopierar frontend-filer...${NC}"
cp frontend/dist/index.html $DEPLOY_DIR/
cp -r frontend/dist/assets $DEPLOY_DIR/

# Copy backend files
echo -e "${YELLOW}Kopierar backend-filer...${NC}"
mkdir -p $DEPLOY_DIR/backend/api/admin
mkdir -p $DEPLOY_DIR/backend/config
mkdir -p $DEPLOY_DIR/backend/sql

# API files
cp backend/api/login.php $DEPLOY_DIR/backend/api/
cp backend/api/getBookings.php $DEPLOY_DIR/backend/api/
cp backend/api/createBooking.php $DEPLOY_DIR/backend/api/
cp backend/api/deleteBooking.php $DEPLOY_DIR/backend/api/
cp backend/api/getBookingHistory.php $DEPLOY_DIR/backend/api/
cp backend/api/index.php $DEPLOY_DIR/backend/api/

# Admin API files
cp backend/api/admin/*.php $DEPLOY_DIR/backend/api/admin/

# Config files
cp backend/config/config.php $DEPLOY_DIR/backend/config/
cp backend/config/auth.php $DEPLOY_DIR/backend/config/

# SQL setup script
cp backend/sql/production-setup.sql $DEPLOY_DIR/backend/sql/

# .env file
cp backend/.env $DEPLOY_DIR/backend/

# .htaccess files
echo -e "${YELLOW}Kopierar .htaccess-filer...${NC}"
cp .htaccess $DEPLOY_DIR/
cp backend/.htaccess $DEPLOY_DIR/backend/

# Create README for deployment
cat > $DEPLOY_DIR/README.txt << 'EOF'
==============================================
  DEPLOYMENT PACKAGE FÖR ONE.COM
==============================================

INNEHÅLL:
---------
- index.html och assets/ → Ladda upp till public_html/
- backend/ → Ladda upp till public_html/backend/
- .htaccess → Ladda upp till public_html/

INSTRUKTIONER:
--------------
1. Ladda upp alla filer till public_html/ på one.com
2. Kontrollera att backend/.env har rätt databasuppgifter
3. Kör backend/sql/production-setup.sql i phpMyAdmin
4. Testa på https://fastai.se

LÖSENORD FÖR TEST:
------------------
- Admin: admin123
- Föreningar: petertestar

Se DEPLOYMENT.md för fullständiga instruktioner!
EOF

echo -e "${GREEN}✓ Deployment-package skapat!${NC}"
echo ""
echo "Deployment-mapp: $DEPLOY_DIR/"
echo ""
echo "Nästa steg:"
echo "1. Granska filerna i $DEPLOY_DIR/"
echo "2. Ladda upp till one.com via FTP eller File Manager"
echo "3. Följ instruktionerna i DEPLOYMENT.md"
echo ""
echo -e "${YELLOW}Filstruktur:${NC}"
tree -L 3 $DEPLOY_DIR/ 2>/dev/null || find $DEPLOY_DIR/ -type f | head -20
