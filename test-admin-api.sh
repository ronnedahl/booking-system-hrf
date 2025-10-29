#!/bin/bash

API_URL="http://localhost:8000"
COOKIE_FILE="/tmp/admin_cookies.txt"

echo "=== Testing Admin Association Management API ==="
echo ""

# Step 1: Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"code": "admin123"}' \
  "$API_URL/api/login.php")

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Step 2: Get all associations
echo "2. Getting all associations..."
ASSOCIATIONS=$(curl -s -b $COOKIE_FILE "$API_URL/api/admin/getAssociations.php")
echo "Associations: $ASSOCIATIONS"
echo ""

# Step 3: Create new association
echo "3. Creating new association 'Test Förening'..."
CREATE_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Förening", "password": "test123"}' \
  "$API_URL/api/admin/createAssociation.php")

echo "Create response: $CREATE_RESPONSE"
NEW_ASSOCIATION_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "New association ID: $NEW_ASSOCIATION_ID"
echo ""

# Step 4: Get associations again to verify creation
echo "4. Getting all associations after creation..."
ASSOCIATIONS_AFTER=$(curl -s -b $COOKIE_FILE "$API_URL/api/admin/getAssociations.php")
echo "Associations after: $ASSOCIATIONS_AFTER"
echo ""

# Step 5: Delete the test association
if [ ! -z "$NEW_ASSOCIATION_ID" ]; then
  echo "5. Deleting test association (ID: $NEW_ASSOCIATION_ID)..."
  DELETE_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST \
    -H "Content-Type: application/json" \
    -d "{\"associationId\": $NEW_ASSOCIATION_ID}" \
    "$API_URL/api/admin/deleteAssociation.php")
  
  echo "Delete response: $DELETE_RESPONSE"
  echo ""
  
  # Step 6: Get associations again to verify deletion
  echo "6. Getting all associations after deletion..."
  ASSOCIATIONS_FINAL=$(curl -s -b $COOKIE_FILE "$API_URL/api/admin/getAssociations.php")
  echo "Associations final: $ASSOCIATIONS_FINAL"
else
  echo "Skipping deletion - no association ID found"
fi

# Cleanup
rm -f $COOKIE_FILE

echo ""
echo "=== Test Complete ==="
