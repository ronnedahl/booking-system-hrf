#!/bin/bash

API_URL="http://localhost:8000"
COOKIE_FILE="/tmp/booking_cookies.txt"

echo "=== Testing Booking Deletion with Password ==="
echo ""

# Step 1: Login
echo "1. Logging in as Förening A (code: petertestar)..."
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "petertestar"}' \
  "$API_URL/api/login.php")

echo "✓ Login successful"
echo ""

# Step 2: Create test booking
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
echo "2. Creating test booking for $TOMORROW at 13:00..."
CREATE_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"date\": \"$TOMORROW\", \"roomId\": 1, \"startTime\": \"13:00\", \"duration\": 60, \"userFirstname\": \"Test\", \"userLastname\": \"User\", \"associationId\": 1}" \
  "$API_URL/api/createBooking.php")

BOOKING_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "✓ Created booking ID: $BOOKING_ID"
echo ""

if [ -z "$BOOKING_ID" ]; then
  echo "Failed to create test booking. Exiting."
  rm -f $COOKIE_FILE
  exit 1
fi

# Step 3: Try wrong password
echo "3. ❌ Attempting to delete with WRONG password..."
DELETE_WRONG=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"wrongpassword\"}" \
  "$API_URL/api/deleteBooking.php")

if echo "$DELETE_WRONG" | grep -q "Felaktigt lösenord"; then
  echo "✓ Correctly rejected wrong password"
else
  echo "✗ Failed: $DELETE_WRONG"
fi
echo ""

# Step 4: Try correct password
echo "4. ✓ Attempting to delete with CORRECT password..."
DELETE_CORRECT=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"petertestar\"}" \
  "$API_URL/api/deleteBooking.php")

if echo "$DELETE_CORRECT" | grep -q "\"success\":true"; then
  echo "✓ Successfully deleted booking"
else
  echo "✗ Failed: $DELETE_CORRECT"
fi
echo ""

# Step 5: Try to delete same booking again (should fail)
echo "5. Attempting to delete same booking again (should fail)..."
DELETE_AGAIN=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"petertestar\"}" \
  "$API_URL/api/deleteBooking.php")

if echo "$DELETE_AGAIN" | grep -q "hittades inte"; then
  echo "✓ Correctly rejected deletion of non-existent booking"
else
  echo "✗ Unexpected response: $DELETE_AGAIN"
fi
echo ""

rm -f $COOKIE_FILE
echo "=== All Tests Passed! ==="
