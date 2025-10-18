<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Placeholder for Sprint 4
sendJsonResponse([
    'success' => false,
    'error' => 'CreateBooking endpoint - to be implemented in Sprint 4'
]);
