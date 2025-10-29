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

try {
    $pdo = getDbConnection();

    // Check if admin login (password: "admin123")
    $adminStmt = $pdo->prepare("SELECT password_hash FROM admin_credentials WHERE id = 1");
    $adminStmt->execute();
    $adminData = $adminStmt->fetch();

    if ($adminData && password_verify($code, $adminData['password_hash'])) {
        // Admin login successful
        session_start();
        $_SESSION['role'] = 'admin';
        $_SESSION['authenticated'] = true;

        sendJsonResponse([
            'success' => true,
            'role' => 'admin',
            'message' => 'Admin logged in successfully'
        ]);
    }

    // Check association codes from database
    $assocStmt = $pdo->prepare("SELECT id, name, code_hash FROM associations");
    $assocStmt->execute();
    $associations = $assocStmt->fetchAll();

    foreach ($associations as $association) {
        if (password_verify($code, $association['code_hash'])) {
            // Association login successful
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
    }

    // Invalid credentials
    sendErrorResponse('Koden som du angivit är tyvärr fel', 401);

} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
}
