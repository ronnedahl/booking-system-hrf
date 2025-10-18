<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$data = getJsonInput();
validateRequiredFields($data, ['code']);

$code = trim($data['code']);

// Hardcoded credentials for development (replace with DB when MySQL is available)
// Admin password: "admin123"
// Förening A code: "ABC123"
// Förening B code: "XYZ789"

$adminPasswordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin123
$associations = [
    'ABC123' => [
        'id' => 1,
        'name' => 'Förening A',
        'code_hash' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    ],
    'XYZ789' => [
        'id' => 2,
        'name' => 'Förening B',
        'code_hash' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    ]
];

// Check if admin login
if ($code === 'admin123') {
    // Start session
    session_start();
    $_SESSION['role'] = 'admin';
    $_SESSION['authenticated'] = true;

    sendJsonResponse([
        'success' => true,
        'role' => 'admin',
        'message' => 'Admin logged in successfully'
    ]);
}

// Check association codes
if (isset($associations[$code])) {
    $association = $associations[$code];

    // Start session
    session_start();
    $_SESSION['role'] = 'user';
    $_SESSION['authenticated'] = true;
    $_SESSION['associationId'] = $association['id'];
    $_SESSION['associationName'] = $association['name'];

    sendJsonResponse([
        'success' => true,
        'role' => 'user',
        'associationId' => $association['id'],
        'associationName' => $association['name'],
        'message' => 'User logged in successfully'
    ]);
}

// Invalid credentials
sendErrorResponse('Invalid login code', 401);
