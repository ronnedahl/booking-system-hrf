<?php
require_once __DIR__ . '/../config/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Placeholder for Sprint 3
sendJsonResponse([
    'success' => false,
    'error' => 'GetBookings endpoint - to be implemented in Sprint 3'
]);
