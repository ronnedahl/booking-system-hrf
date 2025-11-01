<?php
require_once __DIR__ . '/../config/config.php';

setCorsHeaders();

// Simple router
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Route to appropriate handler
if (preg_match('#^/api/login\.php$#', $path)) {
    require __DIR__ . '/login.php';
} elseif (preg_match('#^/api/getBookings\.php$#', $path)) {
    require __DIR__ . '/getBookings.php';
} elseif (preg_match('#^/api/createBooking\.php$#', $path)) {
    require __DIR__ . '/createBooking.php';
} elseif (preg_match('#^/api/admin/getAssociations\.php$#', $path)) {
    require __DIR__ . '/admin/getAssociations.php';
} elseif (preg_match('#^/api/admin/updateAssociationPassword\.php$#', $path)) {
    require __DIR__ . '/admin/updateAssociationPassword.php';
} else {
    sendErrorResponse('Endpoint not found', 404);
}
