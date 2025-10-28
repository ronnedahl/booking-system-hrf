#!/bin/bash

API_URL="http://localhost:8000"
COOKIE_FILE="/tmp/booking_cookies.txt"

echo "=== Testing Booking Deletion with Password ==="
echo ""

# Step 1: Create a test booking first
echo "1. Logging in as Förening A (code: petertestar)..."
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "petertestar"}' \
  "$API_URL/api/login.php")

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Step 2: Create a test booking for tomorrow
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
echo "2. Creating test booking for $TOMORROW at 14:00..."
CREATE_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"date\": \"$TOMORROW\", \"roomId\": 1, \"startTime\": \"14:00\", \"duration\": 60, \"userFirstname\": \"Test\", \"userLastname\": \"User\", \"associationId\": 1}" \
  "$API_URL/api/createBooking.php")

echo "Create response: $CREATE_RESPONSE"
BOOKING_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Created booking ID: $BOOKING_ID"
echo ""

if [ -z "$BOOKING_ID" ]; then
  echo "Failed to create test booking. Exiting."
  rm -f $COOKIE_FILE
  exit 1
fi

# Step 3: Try to delete with wrong password
echo "3. Attempting to delete booking with WRONG password..."
DELETE_WRONG=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"wrongpassword\"}" \
  "$API_URL/api/deleteBooking.php")

echo "Delete with wrong password: $DELETE_WRONG"
echo ""

# Step 4: Try to delete with correct password
echo "4. Attempting to delete booking with CORRECT password (petertestar)..."
DELETE_CORRECT=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"petertestar\"}" \
  "$API_URL/api/deleteBooking.php")

echo "Delete with correct password: $DELETE_CORRECT"
echo ""

# Step 5: Try to delete same booking again (should fail - not found)
echo "5. Attempting to delete same booking again (should fail)..."
DELETE_AGAIN=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID, \"password\": \"petertestar\"}" \
  "$API_URL/api/deleteBooking.php")

echo "Delete again response: $DELETE_AGAIN"
echo ""

# Step 6: Test deleting booking from different association (should fail)
echo "6. Creating booking as Förening A and trying to delete as Förening B..."

# Create booking as Förening A (already logged in)
CREATE_RESPONSE2=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"date\": \"$TOMORROW\", \"roomId\": 2, \"startTime\": \"15:00\", \"duration\": 60, \"userFirstname\": \"Test2\", \"userLastname\": \"User2\", \"associationId\": 1}" \
  "$API_URL/api/createBooking.php")

BOOKING_ID2=$(echo $CREATE_RESPONSE2 | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Created booking ID 2: $BOOKING_ID2"

# Login as Förening B
rm -f $COOKIE_FILE
LOGIN_RESPONSE2=$(curl -s -c $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "petertestar"}' \
  "$API_URL/api/login.php")

ASSOC_ID=$(echo $LOGIN_RESPONSE2 | grep -o '"associationId":[0-9]*' | grep -o '[0-9]*')
echo "Logged in as association ID: $ASSOC_ID"

# Try to delete Förening A's booking (should fail - wrong association)
DELETE_OTHER=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d "{\"bookingId\": $BOOKING_ID2, \"password\": \"petertestar\"}" \
  "$API_URL/api/deleteBooking.php")

echo "Delete other association's booking: $DELETE_OTHER"
echo ""

# Cleanup - login back as Förening A and delete the test booking if it still exists
rm -f $COOKIE_FILE
curl -s -c $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "petertestar"}' \
  "$API_URL/api/login.php" > /dev/null

if [ ! -z "$BOOKING_ID2" ]; then
  curl -s -b $COOKIE_FILE -X POST \
    -H "Content-Type: application/json" \
    -d "{\"bookingId\": $BOOKING_ID2, \"password\": \"petertestar\"}" \
    "$API_URL/api/deleteBooking.php" > /dev/null
fi

rm -f $COOKIE_FILE

echo "=== Test Complete ==="
