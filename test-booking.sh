#!/bin/bash
# Test script för createBooking.php endpoint
# Kör detta script för att testa bokningsfunktionaliteten

echo "=== Testing createBooking.php endpoint ==="
echo ""

# Färger för output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"

# Funktion för att visa testresultat
print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Steg 1: Logga in först (krävs för autentisering)
print_test "1. Logging in with association code"
LOGIN_RESPONSE=$(curl -s -c /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}')

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    print_success "Login successful"
else
    print_error "Login failed"
    exit 1
fi

echo ""
echo "----------------------------------------"
echo ""

# Steg 2: Testa giltig bokning
print_test "2. Creating valid booking (tomorrow, 10:00, 60 minutes)"

# Beräkna morgondagens datum
TOMORROW=$(date -d "tomorrow" +%Y-%m-%d)

BOOKING_RESPONSE=$(curl -s -b /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"${TOMORROW}\",
    \"roomId\": 1,
    \"startTime\": \"10:00\",
    \"duration\": 60,
    \"userFirstname\": \"Test User\",
    \"associationId\": 1
  }")

echo "Response: $BOOKING_RESPONSE"

if echo "$BOOKING_RESPONSE" | grep -q '"success":true'; then
    print_success "Booking created successfully"
else
    print_error "Booking creation failed"
fi

echo ""
echo "----------------------------------------"
echo ""

# Steg 3: Testa bokning i förflutet (bör misslyckas)
print_test "3. Trying to book in the past (should fail)"

PAST_RESPONSE=$(curl -s -b /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-01",
    "roomId": 1,
    "startTime": "10:00",
    "duration": 60,
    "userFirstname": "Test User",
    "associationId": 1
  }')

echo "Response: $PAST_RESPONSE"

if echo "$PAST_RESPONSE" | grep -q "Cannot book dates in the past"; then
    print_success "Correctly rejected booking in the past"
else
    print_error "Should have rejected past date"
fi

echo ""
echo "----------------------------------------"
echo ""

# Steg 4: Testa ogiltig duration (bör misslyckas)
print_test "4. Trying invalid duration (should fail)"

INVALID_DURATION=$(curl -s -b /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"${TOMORROW}\",
    \"roomId\": 1,
    \"startTime\": \"10:00\",
    \"duration\": 45,
    \"userFirstname\": \"Test User\",
    \"associationId\": 1
  }")

echo "Response: $INVALID_DURATION"

if echo "$INVALID_DURATION" | grep -q "Duration must be"; then
    print_success "Correctly rejected invalid duration"
else
    print_error "Should have rejected invalid duration"
fi

echo ""
echo "----------------------------------------"
echo ""

# Steg 5: Testa bokning utanför öppettider (bör misslyckas)
print_test "5. Trying to book outside business hours (should fail)"

OUTSIDE_HOURS=$(curl -s -b /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"${TOMORROW}\",
    \"roomId\": 1,
    \"startTime\": \"18:00\",
    \"duration\": 60,
    \"userFirstname\": \"Test User\",
    \"associationId\": 1
  }")

echo "Response: $OUTSIDE_HOURS"

if echo "$OUTSIDE_HOURS" | grep -q "must end by 17:00"; then
    print_success "Correctly rejected booking outside business hours"
else
    print_error "Should have rejected booking outside hours"
fi

echo ""
echo "----------------------------------------"
echo ""

# Steg 6: Testa saknade fält (bör misslyckas)
print_test "6. Trying to book without required fields (should fail)"

MISSING_FIELDS=$(curl -s -b /tmp/cookies.txt -X POST \
  ${BASE_URL}/api/createBooking.php \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-15",
    "roomId": 1
  }')

echo "Response: $MISSING_FIELDS"

if echo "$MISSING_FIELDS" | grep -q "Missing required field"; then
    print_success "Correctly rejected booking with missing fields"
else
    print_error "Should have rejected missing fields"
fi

echo ""
echo "========================================="
echo "Testing complete!"
echo ""

# Städa upp
rm -f /tmp/cookies.txt
