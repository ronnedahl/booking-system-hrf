<?php
require_once __DIR__ . '/config.php';

// Verify admin Bearer token
function verifyAdminToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendErrorResponse('Missing or invalid authorization header', 401);
    }

    $token = $matches[1];
    if ($token !== ADMIN_API_KEY) {
        sendErrorResponse('Invalid admin token', 403);
    }

    return true;
}

// Get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorResponse('Invalid JSON input');
    }

    return $data;
}

// Validate required fields
function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            sendErrorResponse("Missing required field: $field");
        }
    }
    return true;
}

// Hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
